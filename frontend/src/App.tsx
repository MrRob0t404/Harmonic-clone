import "./App.css";
import { useEffect, useState, useCallback } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CompanyTable from "./components/CompanyTable";
import { getCollectionsMetadata } from "./utils/jam-api";
import useApi from "./utils/useApi";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>();
  const { data: collectionResponse, refresh: refreshCollections } = useApi(() =>
    getCollectionsMetadata()
  );

  const handleCompaniesUpdated = useCallback(() => {
    refreshCollections();
  }, [refreshCollections]);

  useEffect(() => {
    if (
      collectionResponse &&
      collectionResponse.length > 0 &&
      !selectedCollectionId
    ) {
      setSelectedCollectionId(collectionResponse[0].id);
    }
  }, [collectionResponse, selectedCollectionId]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="mx-8">
        <div className="font-bold text-xl border-b p-2 mb-4 text-left">
          Harmonic Jam
        </div>
        <div className="flex">
          <div className="w-1/5">
            <p className="font-bold border-b pb-2">Collections</p>
            <div className="flex flex-col gap-2">
              {collectionResponse?.map((collection) => (
                <div
                  key={collection.id}
                  className={`py-1 hover:cursor-pointer hover:bg-orange-300 ${
                    selectedCollectionId === collection.id &&
                    "bg-orange-500 font-bold"
                  }`}
                  onClick={() => {
                    setSelectedCollectionId(collection.id);
                  }}
                >
                  {collection.collection_name}
                </div>
              ))}
            </div>
          </div>
          <div className="w-4/5 ml-4">
            {selectedCollectionId && (
              <CompanyTable
                key={selectedCollectionId}
                selectedCollectionId={selectedCollectionId}
                onCompaniesUpdated={handleCompaniesUpdated}
              />
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
