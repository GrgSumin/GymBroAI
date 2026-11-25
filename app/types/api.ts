/**
 * Client-side mirror of the `/api/chats/*` JSON envelope produced by `ok()` /
 * `fail()` in `lib/api.ts`. The wire shape is frozen — keep these in sync with
 * the server helpers rather than hand-rolling the shape at each call site.
 */

export type ApiErrorCode = "UNAUTHORIZED" | "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_ERROR";

export type ApiErrorBody = {
  /** `ApiErrorCode` in practice; typed loosely because it arrives over the wire. */
  code: string;
  message: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
