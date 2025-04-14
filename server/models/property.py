from sqlalchemy import Column, Integer, String, Float, DateTime
from dbConnection import Base

class PropertyAssessment(Base):
    __tablename__ = 'property_assessment_fy2025_clean'
    
    id = Column(Integer, primary_key=True)
    pid = Column(String)
    st_name = Column(String)
    city = Column(String)
    zip_code = Column(String)
    land_sf = Column(Float)
    gross_area = Column(Float)
    living_area = Column(Float)
    land_value = Column(Float)
    bldg_value = Column(Float)
    total_value = Column(Float)
    gross_tax = Column(Float)
    yr_built = Column(Integer)
    yr_remodel = Column(Integer)
    int_con = Column(String)
    ext_con = Column(String)
    overall_con = Column(String)
    bed_rms = Column(Integer)
    full_bth = Column(Integer)
    hlf_bth = Column(Integer)
    kitchens = Column(Integer)
    heat_type = Column(String)
    ac_type = Column(String)
    fireplaces = Column(Integer)
    num_parking = Column(Integer)
    neighborhood = Column(String)