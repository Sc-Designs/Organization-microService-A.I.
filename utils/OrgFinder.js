
import Organization from '../models/organization.model.js';
import { NotFoundError } from "./errors.js";

const OrgFinder = async ({
  key,
  query,
  includePassword = false,
  lean = false,
  select = null,
}) => {
  try {
    if (!key || !query)
      throw new NotFoundError("Key or query missing in organizationFinder");

    let selectFields = select || (includePassword ? "+password" : "-password");

    let orgQuery = Organization.findOne({ [key]: query }).select(
      selectFields
    );

    if (lean) {
      orgQuery = orgQuery.lean();
    }

    const Org = await orgQuery;
    return Org || null;
  } catch (err) {
    console.error("OrgFinder error:", err.message);
    throw new NotFoundError("Organization not found or error in query");
  }
};
export default OrgFinder;
