# PYTHON IMPORTS
from typing import Annotated, Union
from datetime import datetime, timedelta, timezone

# FAST API IMPORTS
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.templating import Jinja2Templates

# AUTH IMPORTS
import jwt
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

# CRUD IMPORTS
from app.crud.users import get_user

# MODELS
from app.models.users import User
from app.models.authentication import TokenData


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Set up the fast api Application
app = FastAPI()
templates = Jinja2Templates("templates")

# A fake password bearer that takes a token URL and then uses that for oauth requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """This will compare a plain text password when hashed with a hash to confirm it is the correct password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_password_hash(plain_text_password: str) -> str:
    """This function takes a plain text password and returns a hash using the pwd_context"""
    return pwd_context.hash(plain_text_password)


def authenticate_user(fake_db, username: str, password: str) -> Union[User, bool]:
    """This function returns True if the username and password match in the database else returns False"""
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    """This will encode the data and return a json web token with the data encoded in it"""
    copied_data = data.copy()

    if expires_delta:
        expire = (
            datetime.now(timezone.utc) + expires_delta
        )  # expire in delta t from now
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=15
        )  # if not included then 15 minutes from now will do

    copied_data.update({"exp": expire})  # Update the expiry date in the copied data

    encoded_jwt = jwt.encode(
        copied_data, SECRET_KEY, algorithm=ALGORITHM
    )  # Encode the data using the secret key and the algorithm decided

    # return the JSON Web Token
    return encoded_jwt


async def decode_user_details_from_token(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )  # exception if credentials do not match
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )  # decode the json web token
        username: str = payload.get("sub")  # get the username from the token
        if username is None:
            raise credentials_exception

        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception

    return token_data


# async def get_current_active_user(
#     current_user: Annotated[User, Depends(get_current_user)]
# ) -> User | HTTPException:
#     if current_user.disabled:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user