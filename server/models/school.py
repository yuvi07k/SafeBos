from sqlalchemy import Column, Integer, String, Float, DateTime
from dbConnection import Base

class School(Base):
    __tablename__ = 'school_clean'
    
    id = Column(Integer, primary_key=True)
    address = Column(String)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    neighborhood = Column(String)


