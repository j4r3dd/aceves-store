-- Add section column to banners table
ALTER TABLE banners 
ADD COLUMN section TEXT NOT NULL DEFAULT 'main';

-- Create an index for faster filtering by section
CREATE INDEX idx_banners_section ON banners(section);

-- Comment
COMMENT ON COLUMN banners.section IS 'Section where the banner is displayed (main, anillos, collares)';
