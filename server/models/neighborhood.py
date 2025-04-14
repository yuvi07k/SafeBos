# backend/models/neighborhood.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from dbConnection import Base

class NeighborhoodDemographics(Base):
    __tablename__ = 'neighborhood_demographics'
    
    id = Column(Integer, primary_key=True)
    neighborhood = Column(String)
    population = Column(Integer)
    median_family_income = Column(Float)
    per_capita_income = Column(Float)
    # Age distribution
    age_0_9_years = Column(Float)
    age_10_19_years = Column(Float)
    age_20_34_years = Column(Float)
    age_35_54_years = Column(Float)
    age_55_64_years = Column(Float)
    age_65_years_and_over = Column(Float)
    # Education
    less_than_high_school = Column(Float)
    high_school_or_ged = Column(Float)
    some_college_or_associate_degree = Column(Float)
    bachelor_degree_or_higher = Column(Float)
    # Race/ethnicity
    white = Column(Float)
    black_or_african_american = Column(Float)
    hispanic = Column(Float)
    asian_or_pi = Column(Float)
    other = Column(Float)

