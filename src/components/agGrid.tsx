"use strict";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
// import { tableData } from "../assets/data";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../assets/agGrid.css";
import { tableData } from "../assets/data";

type DataItem = {
  orgHierarchy: string[];
  jobTitle: string;
  employmentType: string;
};

const DataGrid = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const columnDefs: ColDef<DataItem>[] = [
    // Note the use of 'ColDef<DataItem>' to specify the types for the columns
    { field: "jobTitle" },
    { field: "employmentType" },
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
        suppressCount: true,
      },
    };
  }, []);
  const getDataPath = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data: any) => {
      return data.orgHierarchy;
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={gridStyle} className="ag-theme-alpine">
          <AgGridReact
            rowData={tableData}
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
