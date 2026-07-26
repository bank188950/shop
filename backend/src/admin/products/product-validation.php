<?php
declare(strict_types=1);

function product_validate_input(array $input): array
{
    $errors = [];
    $name = trim((string) ($input['name'] ?? ''));
    $description = trim((string) ($input['description'] ?? ''));
    $categoryId = filter_var($input['category_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $unitId = filter_var($input['unit_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $salePrice = filter_var($input['sale_price'] ?? null, FILTER_VALIDATE_FLOAT);
    $stockPieceCount = filter_var($input['stock_piece_count'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
    $piecesPerSale = filter_var($input['pieces_per_sale'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $lowStockThreshold = filter_var($input['low_stock_threshold'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);

    if ($name === '') $errors['name'] = 'กรุณาระบุชื่อสินค้า';
    if (mb_strlen($name) > 150) $errors['name'] = 'ชื่อสินค้ายาวเกิน 150 ตัวอักษร';
    if (mb_strlen($description) > 10000) $errors['description'] = 'รายละเอียดสินค้ายาวเกินกำหนด';
    if ($categoryId === false) $errors['category_id'] = 'กรุณาเลือกหมวดสินค้า';
    if ($unitId === false) $errors['unit_id'] = 'กรุณาเลือกหน่วยสินค้า';
    if ($salePrice === false || $salePrice < 0) $errors['sale_price'] = 'ราคาต้องเป็นตัวเลขตั้งแต่ 0 บาท';
    if ($stockPieceCount === false) $errors['stock_piece_count'] = 'จำนวนชิ้นต้องเป็นจำนวนเต็มตั้งแต่ 0';
    if ($piecesPerSale === false) $errors['pieces_per_sale'] = 'จำนวนชิ้นต่อสินค้าต้องมากกว่า 0';
    if ($lowStockThreshold === false) $errors['low_stock_threshold'] = 'จุดแจ้งเตือนต้องเป็นจำนวนเต็มตั้งแต่ 0';
    if ($stockPieceCount !== false && $piecesPerSale !== false && $stockPieceCount % $piecesPerSale !== 0) {
        $errors['stock_piece_count'] = 'จำนวนชิ้นต้องหารด้วยจำนวนชิ้นต่อ 1 สินค้าได้ลงตัว';
    }

    return [[
        'name' => $name,
        'description' => $description ?: null,
        'category_id' => $categoryId,
        'unit_id' => $unitId,
        'sale_price' => $salePrice,
        'stock_piece_count' => $stockPieceCount,
        'pieces_per_sale' => $piecesPerSale,
        'low_stock_threshold' => $lowStockThreshold,
        'is_active' => ($input['is_active'] ?? '1') === '1' ? 1 : 0,
    ], $errors];
}
