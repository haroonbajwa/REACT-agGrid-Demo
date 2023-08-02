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
      const tempDiv = document.createElement("div");
      const value = params.value;
      const icon = "far fa-folder";
      tempDiv.innerHTML =
        (icon && params.node.__hasChildren) ||
        params.node.data.type === "folder"
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
  const [rowData, setRowData] = useState<DataItem[]>([]);
  // const [selectedItem, setSelectedItem] = useState<string>();

  const gridRef = useRef<any>();

  useEffect(() => {
    tableData && setRowData(tableData);
  }, [gridRef]);

  const containerStyle = useMemo(
    () => ({ width: "100%", height: "100%", backgroundColor: "white" }),
    []
  );
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const addNewFolder = useCallback((params: any) => {
    const selectedNode = params.node;
    // add the new folder as a child of the selected node
    const newGroupData = {
      id: Math.floor(Math.random() * (100 - 0) + 0),
      orgHierarchy: [...selectedNode.data.orgHierarchy, "New Folder"],
      jobTitle: "Folder",
      employmentType: "Folder",
      type: "folder", // Set type to "folder" for group rows
    };

    gridRef.current.api.applyTransaction({
      add: [newGroupData],
      addIndex: selectedNode.childIndex + 1, // Add the new folder after the selected node
    });

    // Since the selected node is now a parent, update its "type" property to "folder"
    gridRef.current.api.applyTransaction({
      update: [{ id: selectedNode.data.id, type: "folder" }],
    });
  }, []);

  const deleteFolder = useCallback((params: any) => {
    console.log(params, "deleteFolder");
    const selectedNode = params.node;
    const parentNode = selectedNode.parent;
    if (!parentNode) {
      console.warn("Cannot delete root node.");
      return;
    }

    // Find the index of the folder in the parent node's children
    const indexToDelete = parentNode.childrenAfterGroup.findIndex(
      (node: any) => node.id === selectedNode.id
    );

    if (indexToDelete === -1) {
      console.warn("Folder not found in parent's children.");
      return;
    }

    // Remove the folder's data from the parent node's children
    parentNode.childrenAfterGroup.splice(indexToDelete, 1);

    // Assign the folder's children to the parent node's children
    parentNode.childrenAfterGroup.push(...selectedNode.childrenAfterGroup);

    // Update the parent node's type to "folder" if it has children, otherwise, set it to "leaf"
    // const newType = parentNode.childrenAfterGroup.length ? "folder" : "leaf";
    gridRef.current.api.applyTransaction({
      update: [],
    });

    gridRef.current.api.refreshCells();
    gridRef.current.api.deselectAll();
  }, []);

  const columnDefs: any = [
    { field: "jobTitle" },
    { field: "employmentType" },
    {
      headerName: "Folder",
      field: "newFolder",
      pinned: "right",
      width: 150,
      cellRenderer: (params: any) => {
        console.log(params, "row params");
        const showButtons =
          params.node.allChildrenCount || params.node.data.type === "folder";
        return (
          showButtons && (
            <div style={{ display: "flex" }}>
              <button
                style={{
                  cursor: "pointer",
                  marginRight: "5px",
                  backgroundColor: "green",
                }}
                onClick={() => addNewFolder(params)}
              >
                ＋
              </button>
              <button
                style={{ cursor: "pointer", backgroundColor: "#b81004" }}
                onClick={() => deleteFolder(params)}
              >
                －
              </button>
            </div>
          )
        );
      },
    },
  ];

  const isFolder = (params: any) => {
    return params.data.type === "folder" || params.node.allChildrenCount;
  };

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
    };
  }, []);

  const autoGroupColumnDef = useMemo(() => {
    return {
      headerName: "Employees",
      minWidth: 330,
      editable: isFolder,
      cellRendererParams: {
        // checkbox: true,
        suppressCount: true,
        innerRenderer: getFileCellRenderer(),
      },
      rowDrag: true,
    };
  }, []);
  const getDataPath = useMemo(() => {
    return (data: any) => {
      return data.orgHierarchy;
    };
  }, []);

  // // add new folder under the selected folder/root folder
  // const addNewGroup = useCallback(() => {
  //   const selectedNode = gridRef.current.api.getSelectedNodes()[0]; // Get the selected node (parent node)
  //   console.log(selectedNode, "selectedNode");

  //   // if (!selectedNode || !selectedNode.group) {
  //   if (!selectedNode) {
  //     console.warn("No parent node selected. Adding to root.");
  //     // If no node selected add folder to the root
  //     const newGroupData = {
  //       orgHierarchy: ["New Folder"],
  //       jobTitle: "Folder",
  //       employmentType: "Folder",
  //       type: "folder", // Set type to "folder" for group rows
  //       children: [],
  //     };

  //     gridRef.current.api.applyTransaction({ add: [newGroupData] });
  //   } else {
  //     // add the new folder as a child of the selected node
  //     const newGroupData = {
  //       id: Math.floor(Math.random() * (100 - 0) + 0),
  //       orgHierarchy: [...selectedNode.data.orgHierarchy, "New Folder"],
  //       jobTitle: "Folder",
  //       employmentType: "Folder",
  //       type: "folder", // Set type to "folder" for group rows
  //       children: [],
  //     };

  //     gridRef.current.api.applyTransaction({
  //       add: [newGroupData],
  //       addIndex: selectedNode.childIndex + 1, // Add the new folder after the selected node
  //     });

  //     // Since the selected node is now a parent, update its "type" property to "folder"
  //     gridRef.current.api.applyTransaction({
  //       update: [{ id: selectedNode.data.id, type: "folder" }],
  //     });
  //   }
  // }, []);

  const isSelectionParentOfTarget = (selectedNode: any, targetNode: any) => {
    const children = [...(selectedNode.childrenAfterGroup || [])];

    if (!targetNode) {
      return false;
    }

    while (children.length) {
      const node = children.shift();
      if (!node) {
        continue;
      }

      if (node.key === targetNode.key) {
        return true;
      }

      if (node.childrenAfterGroup && node.childrenAfterGroup.length) {
        children.push(...node.childrenAfterGroup);
      }
    }

    return false;
  };

  const handleRowDragEnter = (params: any) => {
    console.log(params, "params on enter");
  };

  const handleRowDragEnd = (event: any) => {
    const overNode = event.overNode;
    if (!overNode) {
      return;
    }

    // folder to drop into is where we are going to move the file/folder to
    const folderToDropInto =
      overNode.data.type === "folder"
        ? // if over a folder, we take the immediate row
          overNode
        : // if over a file, we take the parent row (which will be a folder)
          overNode.parent;

    // the data we want to move
    const movingData = event.node.data;

    // take new parent path from parent, if data is missing, means it's the root node,
    // which has no data.
    const newParentPath = folderToDropInto.data
      ? folderToDropInto.data.orgHierarchy
      : [];
    const needToChangeParent = !arePathsEqual(
      newParentPath,
      movingData.orgHierarchy
    );

    // check we are not moving a folder into a child folder
    const invalidMode = isSelectionParentOfTarget(event.node, folderToDropInto);
    if (invalidMode) {
      console.log("invalid move");
    }

    if (needToChangeParent && !invalidMode) {
      const updatedRows: any[] = [];
      moveToPath(newParentPath, event.node, updatedRows);

      //@ts-ignore
      gridRef.current.api.applyTransaction({
        update: updatedRows,
      });
      //@ts-ignore
      gridRef.current.api.clearFocusedCell();
    }
  };
  console.log(gridRef, "gridRef");

  const arePathsEqual = (path1: any, path2: any) => {
    console.log(path1, path2, "paths");
    if (path1.length !== path2.length) {
      return false;
    }

    let equal = true;
    path1.forEach(function (item: any, index: any) {
      if (path2[index] !== item) {
        equal = false;
      }
    });

    return equal;
  };

  // this updates the orgHierarchy locations in our data, we update the data
  // before we send it to AG Grid
  const moveToPath = (newParentPath: any, node: any, allUpdatedNodes: any) => {
    // last part of the file path is the file name
    const oldPath = node.data.orgHierarchy;
    const fileName = oldPath[oldPath.length - 1];
    const newChildPath = newParentPath.slice();
    newChildPath.push(fileName);

    node.data.orgHierarchy = newChildPath;

    allUpdatedNodes.push(node.data);

    if (node.childrenAfterGroup) {
      node.childrenAfterGroup.forEach((childNode: any) => {
        moveToPath(newChildPath, childNode, allUpdatedNodes);
      });
    }
  };

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={gridStyle} className="ag-theme-alpine">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            rowDragManaged={true}
            // rowSelection="single"
            onRowDragEnter={handleRowDragEnter}
            onRowDragEnd={handleRowDragEnd}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            treeData
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
