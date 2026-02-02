from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DatabaseError

from app.database import SessionLocal
from app.models.article import Article
from app.schemas.article import ArticleCreate

router = APIRouter(prefix="/articles", tags=["Articles"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):

    # Pre-verifying
    existing_article = db.query(Article).filter(Article.doi == article.doi).first()
    if existing_article:
        raise HTTPException(
            status_code=409,
            detail=f"Article already exists (Title: {article.titre})"
        )

    db_article = Article(**article.dict())
    db.add(db_article)

    try:
        db.commit()
    except DatabaseError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Database Error"
        )

    db.refresh(db_article)
    return db_article

@router.get("/")
def list_articles(db: Session = Depends(get_db)):
    return db.query(Article).all()
