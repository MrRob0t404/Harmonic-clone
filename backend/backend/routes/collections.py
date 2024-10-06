import uuid

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
import uuid

from backend.db import database
from backend.routes.companies import (
    CompanyBatchOutput,
    fetch_companies_with_liked,
)

router = APIRouter(
    prefix="/collections",
    tags=["collections"],
)

class CompanyCollectionMetadata(BaseModel):
    id: uuid.UUID
    collection_name: str


class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionMetadata):
    pass

class AddCompaniesRequest(BaseModel):
    companies: list[int]

class UpdateAllCompaniesRequest(BaseModel):
    update_all: bool

@router.get("", response_model=list[CompanyCollectionMetadata])
def get_all_collection_metadata(
    db: Session = Depends(database.get_db),
):
    collections = db.query(database.CompanyCollection).all()

    return [
        CompanyCollectionMetadata(
            id=collection.id,
            collection_name=collection.collection_name,
        )
        for collection in collections
    ]

# TODO: New Implmentation psedocode:
# 1. Define a new AddCompaniesRequest model to validate the incoming request body.
# 2. Create a new POST route that matches the endpoint in your frontend code.
# 3. Check if the target collection exists.
# 4. Query the database for the companies that need to be added.
# 5. Create new CompanyCollectionAssociation entries for each company.

@router.get("/{collection_id}", response_model=CompanyCollectionOutput)
def get_company_collection_by_id(
    collection_id: uuid.UUID,
    offset: int = Query(
        0, description="The number of items to skip from the beginning"
    ),
    limit: int = Query(10, description="The number of items to fetch"),
    db: Session = Depends(database.get_db),
):
    query = (
        db.query(database.CompanyCollectionAssociation, database.Company)
        .join(database.Company)
        .filter(database.CompanyCollectionAssociation.collection_id == collection_id)
    )

    total_count = query.with_entities(func.count()).scalar()

    results = query.offset(offset).limit(limit).all()
    companies = fetch_companies_with_liked(db, [company.id for _, company in results])

    return CompanyCollectionOutput(
        id=collection_id,
        collection_name=db.query(database.CompanyCollection)
        .get(collection_id)
        .collection_name,
        companies=companies,
        total=total_count,
    )

@router.post("/{collection_id}/update-companies")
def update_companies_in_collection(
    collection_id: uuid.UUID,
    request: AddCompaniesRequest,
    db: Session = Depends(database.get_db)
):
    collection = db.query(database.CompanyCollection).filter(database.CompanyCollection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    liked_collection = db.query(database.CompanyCollection).filter(database.CompanyCollection.collection_name == "Liked Companies").first()
    
    companies = db.query(database.Company).filter(database.Company.id.in_(request.companies)).all()

    for company in companies:
        if collection.collection_name == "Liked Companies":
            # Remove from Liked Companies
            existing_association = db.query(database.CompanyCollectionAssociation).filter(
                database.CompanyCollectionAssociation.collection_id == collection.id,
                database.CompanyCollectionAssociation.company_id == company.id
            ).first()
            if existing_association:
                db.delete(existing_association)
        else:
            # Add to or remove from Liked Companies
            liked_association = db.query(database.CompanyCollectionAssociation).filter(
                database.CompanyCollectionAssociation.collection_id == liked_collection.id,
                database.CompanyCollectionAssociation.company_id == company.id
            ).first()

            if liked_association:
                db.delete(liked_association)
            else:
                new_association = database.CompanyCollectionAssociation(
                    collection_id=liked_collection.id,
                    company_id=company.id
                )
                db.add(new_association)

    try:
        db.commit()
        return {"message": "Companies updated in collection successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/{collection_id}/update-all-companies")
def update_all_companies_in_collection(
    collection_id: uuid.UUID,
    request: UpdateAllCompaniesRequest,
    db: Session = Depends(database.get_db)
):
    collection = db.query(database.CompanyCollection).filter(database.CompanyCollection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    liked_collection = db.query(database.CompanyCollection).filter(database.CompanyCollection.collection_name == "Liked Companies").first()

    if collection.collection_name == "Liked Companies":
        # Remove all companies from Liked Companies
        db.query(database.CompanyCollectionAssociation).filter(
            database.CompanyCollectionAssociation.collection_id == collection.id
        ).delete(synchronize_session=False)
    else:
        # Add all companies to Liked Companies or remove all from Liked Companies
        if request.update_all:
            # Add all companies not already in Liked Companies
            db.execute(
                f"""
                INSERT INTO company_collection_associations (collection_id, company_id)
                SELECT '{liked_collection.id}', c.id
                FROM companies c
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM company_collection_associations cca
                    WHERE cca.collection_id = '{liked_collection.id}'
                    AND cca.company_id = c.id
                )
                """
            )
        else:
            # Remove all companies from Liked Companies
            db.query(database.CompanyCollectionAssociation).filter(
                database.CompanyCollectionAssociation.collection_id == liked_collection.id
            ).delete(synchronize_session=False)

    try:
        db.commit()
        return {"message": "All companies updated in collection successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



