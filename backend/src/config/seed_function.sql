CREATE OR REPLACE FUNCTION seed_company_defaults(company_id UUID) RETURNS void AS $$
BEGIN
  INSERT INTO groups (company_id, name, type) VALUES
    (company_id, 'Assets', 'asset'),
    (company_id, 'Liabilities', 'liability'),
    (company_id, 'Income', 'income'),
    (company_id, 'Expenses', 'expense')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;