from sqlalchemy import Column, Integer, String, Float, DateTime
from dbConnection import Base

class MBTAStop(Base):
    __tablename__ = 'mbta_stops_clean'
    
    id = Column(Integer, primary_key=True)
    stop_id = Column(String)
    stop_name = Column(String)
    stop_lat = Column(Float)
    stop_lon = Column(Float)
    stop_url = Column(String)
    wheelchair_boarding = Column(String)
    on_street = Column(String)
    at_street = Column(String)
    neighborhood = Column(String)
