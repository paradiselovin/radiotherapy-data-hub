from fastapi import APIRouter, UploadFile, File, status

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload/{experiment_id}", status_code=status.HTTP_201_CREATED)
def upload_file(experiment_id: int, file: UploadFile = File(...)):
    path = f"data/uploads/{experiment_id}_{file.filename}"
    with open(path, "wb") as f:
        f.write(file.file.read())

    return {"filename": file.filename, "path": path}
