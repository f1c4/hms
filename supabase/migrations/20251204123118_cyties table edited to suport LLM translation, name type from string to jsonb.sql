alter table "public"."cities" alter column "name" set data type jsonb using "name"::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS cities_name_country_id_key ON public.cities USING btree (name, country_id);

drop policy "DEV-ONLY: Allow all authenticated users full access to insuranc" on "storage"."objects";


  create policy "DEV-ONLY: Allow  users full access to insurances"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'patient-insurances'::text) AND (auth.role() = 'authenticated'::text)))
with check (((bucket_id = 'patient-insurances'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "DEV-ONLY: Allow all users full access"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'patient-id-documents'::text) AND (auth.role() = 'authenticated'::text)))
with check (((bucket_id = 'patient-id-documents'::text) AND (auth.role() = 'authenticated'::text)));



