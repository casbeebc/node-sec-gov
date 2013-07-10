-- Table: sec_people

-- DROP TABLE sec_people;

CREATE TABLE sec_people
(
  cik character varying,
  person_cik character varying,
  last_name character varying,
  first_name character varying,
  middle_name character varying,
  suffix character varying,
  owner_type character varying,
  transaction_date timestamp with time zone
)
WITH (
  OIDS=FALSE
);
ALTER TABLE sec_people
  OWNER TO dbuser;
GRANT ALL ON TABLE sec_people TO public;
GRANT ALL ON TABLE sec_people TO dbuser;

-- Table: stocks_sec

-- DROP TABLE stocks_sec;

CREATE TABLE stocks_sec
(
  symbol character(10) NOT NULL,
  name character varying,
  address_mailing_city character(50),
  address_mailing_state character(50),
  address_mailing_phone character(50),
  address_mailing_street1 character(100),
  address_mailing_street2 character(100),
  address_mailing_zip character(50),
  address_business_city character(50),
  address_business_state character(50),
  address_business_phone character(50),
  address_business_street1 character(100),
  address_business_street2 character(100),
  address_business_zip character(50),
  cik character varying,
  sic character(20),
  sic_description character varying,
  fiscal_year_end character(10),
  state_location character(50),
  state_of_incorporation character(50)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE stocks_sec
  OWNER TO postgres;
GRANT ALL ON TABLE stocks_sec TO public;
GRANT ALL ON TABLE stocks_sec TO postgres;
