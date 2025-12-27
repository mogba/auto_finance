/// <reference types="xlsx" />

// Type declaration for xlsx/xlsx.mjs - it has the same API as xlsx
// This module is the ES module version of xlsx, so we declare it to have the same types
declare module "xlsx/xlsx.mjs" {
  // Re-export everything from xlsx types
  export * from "xlsx";
  
  // Also export as default/commonjs style
  import XLSX = require("xlsx");
  export = XLSX;
}
