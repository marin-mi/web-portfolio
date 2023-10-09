from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Depends, HTTPException, Form, Request
from sqlalchemy.orm import Session
from models import SessionLocal, engine, Post

app = FastAPI()

# データベーステーブルの作成
Post.metadata.create_all(bind=engine)

# データベースセッションを取得


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/post/")
def create_post(name: str = Form(...),
                email: str = Form(...),
                content: str = Form(...),
                db: Session = Depends(get_db)):
    post = Post(name=name, email=email, content=content)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@app.get("/posts/")
def read_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    posts = db.query(Post).offset(skip).limit(limit).all()
    return posts


templates = Jinja2Templates(directory="templates")


@app.get("/")
def read_root(request: Request, db: Session = Depends(get_db)):
    posts = db.query(Post).all()
    return templates.TemplateResponse("index.html",
                                      {"request": request, "posts": posts})
