import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
// import { ColDef } from "ag-grid-community";
// import { tableData } from "../assets/data";

import { tableData } from "../assets/data";

import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../assets/agGrid.css";

type DataItem = {
  orgHierarchy: string[];
  jobTitle: string;
  employmentType: string;
  id: number;
  newFolderButton?: string;
};

const getFileCellRenderer = () => {
  class FileCellRenderer {
    init(params: any) {
      console.log(params, "cell renderer");
      const tempDiv = document.createElement("div");
      const value = params.value;
      const icon = "far fa-folder";
      tempDiv.innerHTML =
        icon && params.node.__hasChildren
          ? "<span>📁" + '<span class="filename"></span>' + value + "</span>"
          : value;
      //@ts-ignore
      this.eGui = tempDiv.firstChild;
    }
    getGui() {
      //@ts-ignore
      return this.eGui;
    }
    refresh() {
      return false;
    }
  }
  return FileCellRenderer;
};

//component function
const DataGrid = () => {
  const [rowData, setRowData] = useState<DataItem[]>();
  const [selectedItem, setSelectedItem] = useState<string>();

  const gridRef = useRef<any>();

  useEffect(() => {
    tableData && setRowData(tableData);
  }, [gridRef]);

  const containerStyle = useMemo(
    () => ({ width: "100%", height: "100%", backgroundColor: "white" }),
    []
  );
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const columnDefs: any = [{ field: "jobTitle" }, { field: "employmentType" }];
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
    };
  }, []);

  const autoGroupColumnDef = useMemo(() => {
    return {
      headerName: "Employees",
      minWidth: 330,
      cellRendererParams: {
        checkbox: true,
        suppressCount: true,
        innerRenderer: getFileCellRenderer(),
      },
    };
  }, []);
  const getDataPath = useMemo(() => {
    return (data: any) => {
      return data.orgHierarchy;
    };
  }, []);

  // add new folder under the selected folder/root folder
  const addNewGroup = useCallback(() => {
    const selectedNode = gridRef.current.api.getSelectedNodes()[0]; // Get the selected node (parent node)

    if (!selectedNode) {
      console.warn("No node selected. Adding to root.");
      // If no node selected, add to the root
      const newGroupData = {
        id: Math.floor(Math.random() * (100 - 0) + 0),
        orgHierarchy: ["New Folder"],
        jobTitle: "Folder",
        employmentType: "Folder",
      };

      gridRef.current.api.applyTransaction({ add: [newGroupData] });
    } else {
      // If a node is selected, add the new folder as a child of the selected node
      const newGroupData = {
        id: Math.floor(Math.random() * (100 - 0) + 0),
        orgHierarchy: [...selectedNode.data.orgHierarchy, "New Folder"],
        jobTitle: "",
        employmentType: "",
      };

      gridRef.current.api.applyTransaction({
        add: [newGroupData],
        addIndex: selectedNode.childIndex + 1, // Add the new folder after the selected node
      });
    }
  }, []);

  const isSelectionParentOfTarget = (selectedNode: any, targetNode: any) => {
    const children = selectedNode.childrenAfterGroup || [];
    for (let i = 0; i < children.length; i++) {
      if (targetNode && children[i].key === targetNode.key) return true;
      isSelectionParentOfTarget(children[i], targetNode);
    }
    return false;
  };

  const getRowsToUpdate = (node: any, parentPath: any) => {
    let res: any[] = [];
    const newPath = parentPath.concat([node.key]);
    if (node.data) {
      // groups without data, i.e. 'filler groups' don't need path updated
      node.data.filePath = newPath;
    }
    const children = node.childrenAfterGroup || [];
    for (let i = 0; i < children.length; i++) {
      const updatedChildRowData = getRowsToUpdate(children[i], newPath);
      res = res.concat(updatedChildRowData);
    }
    // ignore nodes that have no data, i.e. 'filler groups'
    return node.data ? res.concat([node.data]) : res;
  };

  // move selected to target node
  const moveSelectedNodeToTarget = useCallback((targetRowId: string) => {
    const selectedNode = gridRef.current.api.getSelectedNodes()[0]; // single selection
    if (!selectedNode) {
      console.warn("No nodes selected!");
      return;
    }
    const targetNode = gridRef.current.api.getRowNode(targetRowId);
    console.log(targetRowId, "target");
    const invalidMove =
      selectedNode?.key === targetNode?.key ||
      isSelectionParentOfTarget(selectedNode, targetNode);
    if (invalidMove) {
      console.warn("Invalid selection - must not be parent or same as target!");
      return;
    }
    const rowsToUpdate = getRowsToUpdate(
      selectedNode,
      targetNode?.data.filePath
    );
    gridRef.current.api.applyTransaction({ update: rowsToUpdate });
  }, []);

  const removeSelected = () => {};

  const handleRowDragEnter = (params: any) => {
    console.log(params, "params on enter");
  };

  const handleRowDragEnd = (params: any) => {
    console.log(params, "params on end");
  };

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={{ marginBottom: "10px", marginLeft: "10px" }}>
          <button onClick={addNewGroup} style={{ margin: "5px" }}>
            Add New Group
          </button>
          <button
            onClick={() =>
              moveSelectedNodeToTarget(selectedItem?.toString() || "")
            }
            style={{ margin: "5px" }}
          >
            Move Selected to
          </button>
          <select onChange={(e) => setSelectedItem(e.target.value)}>
            {rowData?.map((row) => {
              console.log(row, "row");
              return (
                <option value={row.id}>
                  {row.orgHierarchy[row.orgHierarchy.length - 1]}
                </option>
              );
            })}
          </select>
          <button onClick={removeSelected} style={{ margin: "5px" }}>
            Remove Selected
          </button>
        </div>
        <div style={gridStyle} className="ag-theme-alpine">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            rowDragManaged={true}
            onRowDragEnter={handleRowDragEnter}
            onRowDragEnd={handleRowDragEnd}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            treeData={true}
            animateRows={true}
            groupDefaultExpanded={-1}
            getDataPath={getDataPath}
          />
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
