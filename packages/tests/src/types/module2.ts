import { Reflective } from "tsruntime";
import { ExportedClass } from "./module";

 @Reflective
 export class TestClass3 {
  exported!: ExportedClass
}