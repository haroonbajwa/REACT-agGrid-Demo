import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { v4 as uuid } from "uuid";
// import Swal from "sweetalert2";
// import { ColDef } from "ag-grid-community";
// import { tableData } from "../assets/data";

import { tableData, folders } from "../assets/data";

import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../assets/agGrid.css";
import Swal from "sweetalert2";

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
  const gridRef = useRef<any>();
  const [foldersData, setFoldersData] = useState<any>([]);
  const [recordsData, setRecordsData] = useState<any>([]);

  useEffect(() => {
    folders && setFoldersData(folders);
    tableData && setRecordsData(tableData);
  }, []);

  //convert data into tree structure
  const convertFormat1ToFormat2 = (tableData: any[], folders: any[]): any[] => {
    const format2Data: any[] = [];
    const processedFolders = new Set();

    const findFolderById = (folderId: any) => {
      return folders.find((folder: any) => folder.id === folderId);
    };

    const processFolder = (folder: any, parentHierarchy: string[] = []) => {
      const folderData = {
        orgHierarchy: [...parentHierarchy, folder.name],
        id: folder.id,
      };

      format2Data.push(folderData);
      processedFolders.add(folder.id);

      if (folder.children && folder.children.length > 0) {
        folder.children.forEach((recordId: any) => {
          const record = tableData.find((item: any) => item.id === recordId);
          if (record) {
            const recordData = {
              orgHierarchy: [
                ...folderData.orgHierarchy,
                `${folder.name} Record${recordId}`,
              ],
              ...record,
            };
            format2Data.push(recordData);
          }
        });
      }

      if (folder.subFolderChildren && folder.subFolderChildren.length > 0) {
        folder.subFolderChildren.forEach((subFolderId: any) => {
          if (!processedFolders.has(subFolderId)) {
            const subFolder = findFolderById(subFolderId);
            if (subFolder) {
              processFolder(subFolder, folderData.orgHierarchy);
            }
          }
        });
      }
    };

    folders.forEach((folder: any) => {
      if (!processedFolders.has(folder.id)) {
        processFolder(folder);
      }
    });

    // Add records that are not assigned to any folder (at the root level)
    tableData.forEach((record: any) => {
      const isAssignedToFolder = folders.some((folder: any) =>
        folder.children?.includes(record.id)
      );
      if (!isAssignedToFolder) {
        format2Data.push({
          orgHierarchy: [record.jobTitle],
          id: record.id,
          ...record,
        });
      }
    });

    const finalFormatData = format2Data.filter((d) => d.id !== undefined);

    return finalFormatData;
  };

  // const hasParentFolder = (folderId: number): boolean => {
  //   return folders.some(
  //     (folder) =>
  //       folder.children?.includes(folderId) ||
  //       folder.subFolderChildren?.includes(folderId)
  //   );
  // };

  const format2Data = convertFormat1ToFormat2(recordsData, foldersData);
  console.log(format2Data, "data converted");

  //add child folder inside any folder
  const addChildFolder = (folderId: number) => {
    Swal.fire({
      title: "Enter Folder Name",
      input: "text",
      showCancelButton: true,
      confirmButtonText: "Add Folder",
      showLoaderOnConfirm: true,
      preConfirm: (folderName) => {
        return new Promise((resolve, reject) => {
          // Check if a folder with the same name already exists
          const isFolderNameExists = foldersData.some(
            (folder: any) => folder.name === folderName
          );

          if (isFolderNameExists) {
            reject("Folder with the same name already exists.");
          } else {
            // Simulate an asynchronous operation to create the folder
            setTimeout(() => {
              resolve(folderName);
            }, 1000);
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    })
      .then((result) => {
        if (result.isConfirmed) {
          const newFolderName = result.value;

          setFoldersData((prevFoldersData: any) => {
            const parentFolder = prevFoldersData.find(
              (folder: any) => folder.id === folderId
            );

            if (parentFolder) {
              const newChildFolder = {
                name: newFolderName,
                subFolderChildren: [],
                id: uuid(), // Assuming you have a function to generate unique IDs
              };

              parentFolder.subFolderChildren = [
                ...(parentFolder.subFolderChildren || []),
                newChildFolder.id,
              ];

              prevFoldersData.push(newChildFolder);
            }

            return [...prevFoldersData];
          });
        }
      })
      .catch((error) => {
        Swal.showValidationMessage(error);
      });
  };

  // delete folder by id
  const deleteFolderById = (folderId: any) => {
    setFoldersData((prevFoldersData: any) => {
      const updatedFoldersData = prevFoldersData.filter(
        (folder: any) => folder.id !== folderId
      );
      const folderToDelete = prevFoldersData.find(
        (folder: any) => folder.id === folderId
      );

      // Reassign child records to parent folder or at the root level
      if (folderToDelete && folderToDelete.children) {
        const unallocatedRecords = folderToDelete.children;
        const parentFolder = prevFoldersData.find((folder: any) =>
          folder.subFolderChildren?.includes(folderId)
        );

        if (parentFolder) {
          parentFolder.children = [
            ...(parentFolder.children || []),
            ...unallocatedRecords,
          ];
        } else {
          updatedFoldersData.push(...unallocatedRecords);
        }

        // Remove the child records from any subfolders
        updatedFoldersData.forEach((folder: any) => {
          if (folder.subFolderChildren) {
            folder.subFolderChildren = folder.subFolderChildren.filter(
              (subFolderId: any) => subFolderId !== folderId
            );
          }
        });
      }
      console.log(updatedFoldersData, "update data");

      return updatedFoldersData;
    });
  };

  const containerStyle = useMemo(
    () => ({ width: "100%", height: "100%", backgroundColor: "white" }),
    []
  );
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const columnDefs: any = [
    { field: "jobTitle" },
    { field: "employmentType" },
    {
      headerName: "Folder",
      field: "newFolder",
      pinned: "right",
      width: 150,
      cellRenderer: (params: any) => {
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
                onClick={() => addChildFolder(params.data.id)}
              >
                ＋
              </button>
              <button
                style={{ cursor: "pointer", backgroundColor: "#b81004" }}
                onClick={() => deleteFolderById(params.data.id)}
              >
                －
              </button>
            </div>
          )
        );
      },
    },
  ];

  // const isFolder = (params: any) => {
  //   return params.data.type === "folder" || params.node.allChildrenCount;
  // };

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
    };
  }, []);

  const autoGroupColumnDef = useMemo(() => {
    return {
      headerName: "Employees",
      minWidth: 330,
      // editable: isFolder,
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
      console.log(data, "get path");
      return data.orgHierarchy;
    };
  }, []);

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
            rowData={format2Data}
            rowDragManaged={true}
            // rowSelection="single"
            onRowDragEnter={handleRowDragEnter}
            onRowDragEnd={handleRowDragEnd}
            // onCellDoubleClicked={handleCellDoubleClick}
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
