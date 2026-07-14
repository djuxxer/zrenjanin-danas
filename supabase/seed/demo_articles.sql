-- =============================================
-- Banatski Glas — Seed Data
-- Run AFTER migrations and creating an admin user
-- =============================================

-- 1. Create admin profile (replace 'YOUR_ADMIN_USER_ID' with actual Supabase auth user id)
-- INSERT INTO public.profiles (id, full_name, role) VALUES ('YOUR_ADMIN_USER_ID', 'Admin Redakcija', 'admin');

-- 2. Seed articles (run after creating profile)
DO $$
DECLARE
  author UUID;
BEGIN
  -- Use first admin user
  SELECT id INTO author FROM public.profiles WHERE role = 'admin' LIMIT 1;

  IF author IS NULL THEN
    RAISE NOTICE 'No admin profile found. Create one first.';
    RETURN;
  END IF;

  INSERT INTO public.articles (slug, title, subtitle, content, excerpt, category, image_url, image_alt, author_id, published, published_at, breaking, featured, trending, views, seo_title, seo_description, tags) VALUES
  (
    'vucic-poseta-zrenjanin-investicije-infrastruktura-2025',
    'Predsednik Vučić najavio rekordna ulaganja u infrastrukturu Zrenjanina',
    'Srbija ubrzano napreduje — novi putevi, fabrike i radna mesta za građane Banata',
    '<p>Predsednik Republike Srbije Aleksandar Vučić posetio je danas Zrenjanin...</p>',
    'Predsednik Vučić obišao Zrenjanin i najavio investicioni paket od 200 miliona evra za infrastrukturu, privredu i nova radna mesta u Banatu.',
    'politika',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80',
    'Državna ceremonija i infrastrukturni projekti u Srbiji',
    author,
    true,
    NOW() - INTERVAL '2 hours',
    true,
    true,
    true,
    15420,
    'Vučić u Zrenjaninu: 200 miliona evra za infrastrukturu i razvoj Banata | Banatski Glas',
    'Predsednik Srbije Aleksandar Vučić najavio rekordna ulaganja u Zrenjanin — novi putevi, industrijska zona i modernizacija komunalne infrastrukture.',
    ARRAY['Vučić', 'investicije', 'infrastruktura', 'Zrenjanin', 'Vojvodina']
  ),
  (
    'novi-most-begej-izgradnja-2025',
    'Novi most na Begeju gotov do kraja godine — vredan 18 miliona evra',
    'Moderne dvosmerne saobraćajnice povećaće protok i bezbednost u gradu',
    '<p>Izgradnja novog mosta na reci Begej u Zrenjaninu ušla je u završnu fazu...</p>',
    'Izgradnja mosta na Begeju u završnoj fazi — vrednost projekta 18 miliona evra, otvaranje planiranog za decembar 2025.',
    'zrenjanin',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
    'Izgradnja novog mosta u gradu',
    author,
    true,
    NOW() - INTERVAL '4 hours',
    false,
    true,
    true,
    8930,
    'Novi most na Begeju: Završetak do kraja 2025, vredan 18 miliona evra | Banatski Glas',
    'Zrenjanin dobija moderan most na Begeju vredan 18 miliona evra — EU fondovi, biciklističke staze i kapacitet za 20.000 vozila dnevno.',
    ARRAY['most', 'Begej', 'infrastruktura', 'EU fondovi']
  ),
  (
    'continental-sirenje-nova-radna-mesta',
    'Continental širi pogone u Zrenjaninu — 500 novih radnih mesta',
    'Nemačka kompanija investira dodatnih 45 miliona evra u proširenje kapaciteta',
    '<p>Multinacionalna kompanija Continental, jedan od najvećih poslodavaca u Zrenjaninu...</p>',
    'Continental ulaže dodatnih 45 miliona evra i otvara 500 novih radnih mesta u Zrenjaninu do 2026. godine.',
    'ekonomija',
    'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&q=80',
    'Moderna industrijska fabrika i radna mesta',
    author,
    true,
    NOW() - INTERVAL '6 hours',
    false,
    true,
    true,
    12100,
    'Continental Zrenjanin: 500 novih radnih mesta i 45 miliona evra investicija | Banatski Glas',
    'Nemačka kompanija Continental širi pogone u Zrenjaninu — 500 novih radnih mesta i 45 miliona evra ulaganja do 2026.',
    ARRAY['Continental', 'investicije', 'radna mesta', 'ekonomija']
  );

  RAISE NOTICE 'Seed completed: 3 articles inserted';
END;
$$;
