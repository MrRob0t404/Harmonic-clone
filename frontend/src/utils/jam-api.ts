import axios from "axios";

export interface ICompany {
  id: number;
  company_name: string;
  liked: boolean;
}

export interface ICollection {
  id: string;
  collection_name: string;
  companies: ICompany[];
  total: number;
}

export interface ICompanyBatchResponse {
  companies: ICompany[];
}

const BASE_URL = "http://localhost:8000";

export async function getCompanies(
  offset?: number,
  limit?: number
): Promise<ICompanyBatchResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/companies`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsById(
  id: string,
  offset?: number,
  limit?: number
): Promise<ICollection> {
  try {
    const response = await axios.get(`${BASE_URL}/collections/${id}`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsMetadata(): Promise<ICollection[]> {
  try {
    const response = await axios.get(`${BASE_URL}/collections`);
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

//  New functionality to handle adding companies from one collection to another
export async function updateCompaniesInCollection(
  targetCollectionId: string,
  companies: ICompany[]
): Promise<void> {
  console.log("updateCompaniesInCollection", targetCollectionId, companies);
  try {
    await axios.post(
      `${BASE_URL}/collections/${targetCollectionId}/update-companies`,
      {
        companies: companies.map((company) => company.id),
      }
    );
  } catch (error) {
    console.error("Error updating companies in collection:", error);
    throw error;
  }
}

export async function updateAllCompaniesInCollection(
  targetCollectionId: string,
  updateAll: boolean
): Promise<void> {
  console.log("updateAllCompaniesInCollection", targetCollectionId, updateAll);
  try {
    await axios.post(
      `${BASE_URL}/collections/${targetCollectionId}/update-all-companies`,
      {
        update_all: updateAll,
      }
    );
  } catch (error) {
    console.error("Error updating all companies in collection:", error);
    throw error;
  }
}
