import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getCollectionsById, ICompany } from "../utils/jam-api";
import { Button, CircularProgress } from "@mui/material";

const CompanyTable = (props: { selectedCollectionId: string }) => {
  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    getCollectionsById(props.selectedCollectionId, offset, pageSize).then(
      (newResponse) => {
        setResponse(newResponse.companies);
        setTotal(newResponse.total);
      }
    );
  }, [props.selectedCollectionId, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
  }, [props.selectedCollectionId]);

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
        rows={response}
        rowHeight={30}
        columns={[
          { field: "liked", headerName: "Liked", width: 90 },
          { field: "id", headerName: "ID", width: 90 },
          { field: "company_name", headerName: "Company Name", width: 200 },
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        rowCount={total}
        pagination
        checkboxSelection
        paginationMode="server"
        onPaginationModelChange={(newMeta) => {
          setPageSize(newMeta.pageSize);
          setOffset(newMeta.page * newMeta.pageSize);
        }}
      />
    </div>
  );
};

export default CompanyTable;
