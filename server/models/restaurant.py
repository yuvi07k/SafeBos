from sqlalchemy import Column, Integer, String, Float, DateTime
from dbConnection import Base

class RestaurantInspection(Base):
    __tablename__ = 'restaurant_inspection_clean'
    
    id = Column(Integer, primary_key=True)
    business_name = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    neighborhood = Column(String) 