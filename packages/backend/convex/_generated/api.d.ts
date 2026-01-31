/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as healthCheck from "../healthCheck.js";
import type * as ingestionJobs from "../ingestionJobs.js";
import type * as insights from "../insights.js";
import type * as jobs_index from "../jobs/index.js";
import type * as jobs_scrapeCaSos from "../jobs/scrapeCaSos.js";
import type * as jobs_scrapeSantaClara from "../jobs/scrapeSantaClara.js";
import type * as jobs_seedAca13 from "../jobs/seedAca13.js";
import type * as lib_fetch from "../lib/fetch.js";
import type * as lib_parsers from "../lib/parsers.js";
import type * as lib_pdf from "../lib/pdf.js";
import type * as lib_pdfExtraction from "../lib/pdfExtraction.js";
import type * as measures from "../measures.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  healthCheck: typeof healthCheck;
  ingestionJobs: typeof ingestionJobs;
  insights: typeof insights;
  "jobs/index": typeof jobs_index;
  "jobs/scrapeCaSos": typeof jobs_scrapeCaSos;
  "jobs/scrapeSantaClara": typeof jobs_scrapeSantaClara;
  "jobs/seedAca13": typeof jobs_seedAca13;
  "lib/fetch": typeof lib_fetch;
  "lib/parsers": typeof lib_parsers;
  "lib/pdf": typeof lib_pdf;
  "lib/pdfExtraction": typeof lib_pdfExtraction;
  measures: typeof measures;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
