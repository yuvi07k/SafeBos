from sqlalchemy import Column, Integer, String, Float, DateTime
from dbConnection import Base

class CrimeIncident(Base):
    __tablename__ = 'crime_incidents_reports_clean'
    
    id = Column(Integer, primary_key=True)
    incident_number = Column(String)
    offense_code = Column(String)
    offense_description = Column(String)
    date = Column(DateTime)
    day_of_week = Column(String)
    hour = Column(Integer)
    street = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    neighborhood = Column(String)
    crime_rate = Column(Float)