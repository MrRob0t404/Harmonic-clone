import React, { useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Button, CircularProgress } from "@mui/material";
import {
  getCollectionsById,
  ICompany,
  updateCompaniesInCollection,
} from "../utils/jam-api";
import useApi from "../utils/useApi";

// Move interface to top for better readability / maintainability
interface CompanyTableProps {
  selectedCollectionId: string;
  onCompaniesUpdated: () => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({
  selectedCollectionId,
  onCompaniesUpdated,
}) => {
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: collectionData,
    loading,
    refresh,
  } = useApi(() => getCollectionsById(selectedCollectionId, offset, pageSize));

  const handleUpdateCompanies = async (companies: ICompany[]) => {
    setIsUpdating(true);
    try {
      await updateCompaniesInCollection(selectedCollectionId, companies);
      console.log("Companies updated successfully");
      refresh();
      onCompaniesUpdated();
    } catch (error) {
      console.error("Error updating companies:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSelected = () => {
    const selectedCompanies =
      collectionData?.companies.filter((company) =>
        selectedRows.includes(company.id)
      ) || [];
    handleUpdateCompanies(selectedCompanies);
  };

  const handleUpdateAll = () => {
    handleUpdateCompanies(collectionData?.companies || []);
  };

  const columns: GridColDef[] = [
    { field: "liked", headerName: "Liked", width: 90, type: "boolean" },
    { field: "id", headerName: "ID", width: 90 },
    { field: "company_name", headerName: "Company Name", width: 200 },
  ];

  const isLikedCollection =
    collectionData?.collection_name === "Liked Companies";
  const buttonText = isLikedCollection ? "Remove" : "Toggle Like";

  return (
    <div style={{ height: 800, width: "100%" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={handleUpdateSelected}
          disabled={selectedRows.length === 0 || loading || isUpdating}
        >
          {buttonText} Selected{" "}
          {isLikedCollection ? "from Liked Companies" : ""}
        </Button>
        <Button
          variant="contained"
          onClick={handleUpdateAll}
          disabled={!collectionData?.companies.length || loading || isUpdating}
        >
          {buttonText} All {isLikedCollection ? "from Liked Companies" : ""}
        </Button>
        {(loading || isUpdating) && <CircularProgress size={24} />}
      </div>
      <DataGrid
        rows={collectionData?.companies || []}
        rowHeight={30}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        rowCount={collectionData?.total || 0}
        pagination
        checkboxSelection
        paginationMode="server"
        onPaginationModelChange={(newMeta) => {
          setPageSize(newMeta.pageSize);
          setOffset(newMeta.page * newMeta.pageSize);
        }}
        loading={loading}
        onRowSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
      />
    </div>
  );
};

export default CompanyTable;

/**
 * Users can add individual items from one list to another using the "Add Selected to Other List" button.
 * Users can add the entire set of companies from one list to another using the "Add All to Other List" button.
 * The UI reflects the in-progress state when a lengthy action is being performed by disabling the buttons and showing a loading indicator.
 */
