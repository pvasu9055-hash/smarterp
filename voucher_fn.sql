CREATE OR REPLACE FUNCTION generate_voucher_number(p_company_id UUID, p_type VARCHAR)
RETURNS VARCHAR AS
CREATE OR REPLACE FUNCTION generate_voucher_number(p_company_id UUID, p_type VARCHAR) RETURNS VARCHAR AS \$\$ DECLARE v_count INT; v_prefix VARCHAR; BEGIN SELECT COUNT(*) INTO v_count FROM vouchers WHERE company_id = p_company_id AND voucher_type = p_type; IF p_type = 'sales' THEN v_prefix := 'SAL'; ELSIF p_type = 'purchase' THEN v_prefix := 'PUR'; ELSE v_prefix := 'VCH'; END IF; RETURN v_prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((v_count + 1)::TEXT, 4, '0'); END; \$\$ LANGUAGE plpgsql;
DECLARE
  v_count INT;
  v_prefix VARCHAR;
BEGIN
  SELECT COUNT(*) INTO v_count FROM vouchers WHERE company_id = p_company_id AND voucher_type = p_type;
  IF p_type = 'sales' THEN v_prefix := 'SAL';
  ELSIF p_type = 'purchase' THEN v_prefix := 'PUR';
  ELSE v_prefix := 'VCH';
  END IF;
  RETURN v_prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
END;
CREATE OR REPLACE FUNCTION generate_voucher_number(p_company_id UUID, p_type VARCHAR) RETURNS VARCHAR AS \$\$ DECLARE v_count INT; v_prefix VARCHAR; BEGIN SELECT COUNT(*) INTO v_count FROM vouchers WHERE company_id = p_company_id AND voucher_type = p_type; IF p_type = 'sales' THEN v_prefix := 'SAL'; ELSIF p_type = 'purchase' THEN v_prefix := 'PUR'; ELSE v_prefix := 'VCH'; END IF; RETURN v_prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((v_count + 1)::TEXT, 4, '0'); END; \$\$ LANGUAGE plpgsql; LANGUAGE plpgsql;
