ALTER TABLE products
  ADD COLUMN is_recommended TINYINT(1) NOT NULL DEFAULT 0 AFTER low_stock_threshold,
  ADD KEY idx_products_recommended (is_active, is_recommended);
