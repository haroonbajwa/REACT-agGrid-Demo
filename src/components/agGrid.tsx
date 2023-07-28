import { useEffect, useMemo, useState } from "react";
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

const DataGrid = () => {
  const [rowData, setRowData] = useState<DataItem[]>();

  useEffect(() => {
    tableData && setRowData(tableData);
  }, []);

  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const handleCreateNewFolder = () => {
    console.log("Create new folder");
  };

  const columnDefs: any = [
    { field: "jobTitle" },
    { field: "employmentType" },
    {
      headerName: "Create Folder",
      cellRendererFramework: () => (
        <button onClick={handleCreateNewFolder}>+</button>
      ),
    },
  ];
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
    };
  }, []);

  const autoGroupColumnDef = useMemo(() => {
    return {
      headerName: "Organisation Hierarchy",
      minWidth: 300,
      cellRendererParams: {
        suppressCount: false,
      },
      rowDrag: true,
    };
  }, []);
  const getDataPath = useMemo(() => {
    return (data: any) => {
      return data.orgHierarchy;
    };
  }, []);

  const handleRowDragEnter = (params: any) => {
    console.log(params, "params on enter");
  };

  const handleRowDragEnd = (params: any) => {
    console.log(params, "params on end");
  };

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={gridStyle} className="ag-theme-alpine">
          <AgGridReact
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
