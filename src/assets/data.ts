  // export const tableData = [
  //   {
  //     orgHierarchy: ['Folder1'],
  //     id: 1
  //   },
  //   {
  //     orgHierarchy: ['Folder1', 'Folder1 Record1',],
  //     jobTitle: 'Director of Operations',
  //     employmentType: 'Permanent',
  //     id: 3
  //   },
  //   {
  //     orgHierarchy: [
  //       'Folder1',
  //       'Folder1 Record2',
  //     ],
  //     jobTitle: 'Fleet Coordinator',
  //     employmentType: 'Permanent',
  //     id: 4
  //   },
  //   {
  //     orgHierarchy: ['Folder2'],
  //     id: 5
  //   },
  //   {
  //     orgHierarchy: [
  //       'Folder2',
  //       'Folder2 Record1'
  //     ],
  //     jobTitle: 'Service Technician',
  //     employmentType: 'Contract',
  //     id: 6
  //   },
  //   {
  //     orgHierarchy: [
  //       'Folder2',
  //       'Folder2 Record2'
  //     ],
  //     jobTitle: 'Inventory Control',
  //     employmentType: 'Permanent',
  //     id: 7
  //   },
  // 
  // ];


    // Your data in "data format 2"
    export const tableData = [
      {
        jobTitle: 'Director of Operations',
        employmentType: 'Permanent',
        id: 1
      },
      {
        jobTitle: 'Fleet Coordinator',
        employmentType: 'Permanent',
        id: 2
      },
      {
        jobTitle: 'Service Technician',
        employmentType: 'Contract',
        id: 3
      },
      {
        jobTitle: 'Inventory Control',
        employmentType: 'Permanent',
        id: 4
      },
    ];
  
    export const folders = [
      {
        name: 'Folder1',
        children: [1, 2],
        // subFolderChildren: [2],
        id: 1
      },
      {
        name: 'Folder2',
        // children: [3], // table data record ids
        subFolderChildren: [3], // folder with id 3 should be its children
        id: 2
      },
      {
        name: 'Folder3',
        children: [4],
        id: 3
      },
    ];