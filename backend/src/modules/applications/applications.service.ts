// Admissions service surface: one file per use case, re-exported for the controller.
export { admitApplication } from "./admit-application.js";
export { bulkTransition } from "./bulk-transition.js";
export { createCatalogApplication } from "./create-application.js";
export { createStudentFromApplication } from "./create-student-from-application.js";
export { exportApplications } from "./export-applications.js";
export { getApplication } from "./get-application.js";
export { applicationSummary,listApplications } from "./list-applications.js";
export { submitApplication } from "./submit-application.js";
export { transitionApplication } from "./transition-application.js";
export { updateApplication } from "./update-application.js";
export { getWaitlist } from "./waitlist.js";
