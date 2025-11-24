drop policy "CRUD for auth users" on "public"."ambulances";

drop policy "CRUD for users" on "public"."drug_register_me";

drop policy "CRUD for authenticated" on "public"."employee_type";

drop policy "CRUD for authenticated" on "public"."employees";

drop policy "CRUD for authenticated" on "public"."exams";

revoke delete on table "public"."ambulances" from "anon";

revoke insert on table "public"."ambulances" from "anon";

revoke references on table "public"."ambulances" from "anon";

revoke select on table "public"."ambulances" from "anon";

revoke trigger on table "public"."ambulances" from "anon";

revoke truncate on table "public"."ambulances" from "anon";

revoke update on table "public"."ambulances" from "anon";

revoke delete on table "public"."ambulances" from "authenticated";

revoke insert on table "public"."ambulances" from "authenticated";

revoke references on table "public"."ambulances" from "authenticated";

revoke select on table "public"."ambulances" from "authenticated";

revoke trigger on table "public"."ambulances" from "authenticated";

revoke truncate on table "public"."ambulances" from "authenticated";

revoke update on table "public"."ambulances" from "authenticated";

revoke delete on table "public"."ambulances" from "service_role";

revoke insert on table "public"."ambulances" from "service_role";

revoke references on table "public"."ambulances" from "service_role";

revoke select on table "public"."ambulances" from "service_role";

revoke trigger on table "public"."ambulances" from "service_role";

revoke truncate on table "public"."ambulances" from "service_role";

revoke update on table "public"."ambulances" from "service_role";

revoke delete on table "public"."companies" from "anon";

revoke insert on table "public"."companies" from "anon";

revoke references on table "public"."companies" from "anon";

revoke select on table "public"."companies" from "anon";

revoke trigger on table "public"."companies" from "anon";

revoke truncate on table "public"."companies" from "anon";

revoke update on table "public"."companies" from "anon";

revoke delete on table "public"."companies" from "authenticated";

revoke insert on table "public"."companies" from "authenticated";

revoke references on table "public"."companies" from "authenticated";

revoke select on table "public"."companies" from "authenticated";

revoke trigger on table "public"."companies" from "authenticated";

revoke truncate on table "public"."companies" from "authenticated";

revoke update on table "public"."companies" from "authenticated";

revoke delete on table "public"."companies" from "service_role";

revoke insert on table "public"."companies" from "service_role";

revoke references on table "public"."companies" from "service_role";

revoke select on table "public"."companies" from "service_role";

revoke trigger on table "public"."companies" from "service_role";

revoke truncate on table "public"."companies" from "service_role";

revoke update on table "public"."companies" from "service_role";

revoke delete on table "public"."drug_register_me" from "anon";

revoke insert on table "public"."drug_register_me" from "anon";

revoke references on table "public"."drug_register_me" from "anon";

revoke select on table "public"."drug_register_me" from "anon";

revoke trigger on table "public"."drug_register_me" from "anon";

revoke truncate on table "public"."drug_register_me" from "anon";

revoke update on table "public"."drug_register_me" from "anon";

revoke delete on table "public"."drug_register_me" from "authenticated";

revoke insert on table "public"."drug_register_me" from "authenticated";

revoke references on table "public"."drug_register_me" from "authenticated";

revoke select on table "public"."drug_register_me" from "authenticated";

revoke trigger on table "public"."drug_register_me" from "authenticated";

revoke truncate on table "public"."drug_register_me" from "authenticated";

revoke update on table "public"."drug_register_me" from "authenticated";

revoke delete on table "public"."drug_register_me" from "service_role";

revoke insert on table "public"."drug_register_me" from "service_role";

revoke references on table "public"."drug_register_me" from "service_role";

revoke select on table "public"."drug_register_me" from "service_role";

revoke trigger on table "public"."drug_register_me" from "service_role";

revoke truncate on table "public"."drug_register_me" from "service_role";

revoke update on table "public"."drug_register_me" from "service_role";

revoke delete on table "public"."drug_register_sr" from "anon";

revoke insert on table "public"."drug_register_sr" from "anon";

revoke references on table "public"."drug_register_sr" from "anon";

revoke select on table "public"."drug_register_sr" from "anon";

revoke trigger on table "public"."drug_register_sr" from "anon";

revoke truncate on table "public"."drug_register_sr" from "anon";

revoke update on table "public"."drug_register_sr" from "anon";

revoke delete on table "public"."drug_register_sr" from "authenticated";

revoke insert on table "public"."drug_register_sr" from "authenticated";

revoke references on table "public"."drug_register_sr" from "authenticated";

revoke select on table "public"."drug_register_sr" from "authenticated";

revoke trigger on table "public"."drug_register_sr" from "authenticated";

revoke truncate on table "public"."drug_register_sr" from "authenticated";

revoke update on table "public"."drug_register_sr" from "authenticated";

revoke delete on table "public"."drug_register_sr" from "service_role";

revoke insert on table "public"."drug_register_sr" from "service_role";

revoke references on table "public"."drug_register_sr" from "service_role";

revoke select on table "public"."drug_register_sr" from "service_role";

revoke trigger on table "public"."drug_register_sr" from "service_role";

revoke truncate on table "public"."drug_register_sr" from "service_role";

revoke update on table "public"."drug_register_sr" from "service_role";

revoke delete on table "public"."employee_documents" from "anon";

revoke insert on table "public"."employee_documents" from "anon";

revoke references on table "public"."employee_documents" from "anon";

revoke select on table "public"."employee_documents" from "anon";

revoke trigger on table "public"."employee_documents" from "anon";

revoke truncate on table "public"."employee_documents" from "anon";

revoke update on table "public"."employee_documents" from "anon";

revoke delete on table "public"."employee_documents" from "authenticated";

revoke insert on table "public"."employee_documents" from "authenticated";

revoke references on table "public"."employee_documents" from "authenticated";

revoke select on table "public"."employee_documents" from "authenticated";

revoke trigger on table "public"."employee_documents" from "authenticated";

revoke truncate on table "public"."employee_documents" from "authenticated";

revoke update on table "public"."employee_documents" from "authenticated";

revoke delete on table "public"."employee_documents" from "service_role";

revoke insert on table "public"."employee_documents" from "service_role";

revoke references on table "public"."employee_documents" from "service_role";

revoke select on table "public"."employee_documents" from "service_role";

revoke trigger on table "public"."employee_documents" from "service_role";

revoke truncate on table "public"."employee_documents" from "service_role";

revoke update on table "public"."employee_documents" from "service_role";

revoke delete on table "public"."employee_type" from "anon";

revoke insert on table "public"."employee_type" from "anon";

revoke references on table "public"."employee_type" from "anon";

revoke select on table "public"."employee_type" from "anon";

revoke trigger on table "public"."employee_type" from "anon";

revoke truncate on table "public"."employee_type" from "anon";

revoke update on table "public"."employee_type" from "anon";

revoke delete on table "public"."employee_type" from "authenticated";

revoke insert on table "public"."employee_type" from "authenticated";

revoke references on table "public"."employee_type" from "authenticated";

revoke select on table "public"."employee_type" from "authenticated";

revoke trigger on table "public"."employee_type" from "authenticated";

revoke truncate on table "public"."employee_type" from "authenticated";

revoke update on table "public"."employee_type" from "authenticated";

revoke delete on table "public"."employee_type" from "service_role";

revoke insert on table "public"."employee_type" from "service_role";

revoke references on table "public"."employee_type" from "service_role";

revoke select on table "public"."employee_type" from "service_role";

revoke trigger on table "public"."employee_type" from "service_role";

revoke truncate on table "public"."employee_type" from "service_role";

revoke update on table "public"."employee_type" from "service_role";

revoke delete on table "public"."employees" from "anon";

revoke insert on table "public"."employees" from "anon";

revoke references on table "public"."employees" from "anon";

revoke select on table "public"."employees" from "anon";

revoke trigger on table "public"."employees" from "anon";

revoke truncate on table "public"."employees" from "anon";

revoke update on table "public"."employees" from "anon";

revoke delete on table "public"."employees" from "authenticated";

revoke insert on table "public"."employees" from "authenticated";

revoke references on table "public"."employees" from "authenticated";

revoke select on table "public"."employees" from "authenticated";

revoke trigger on table "public"."employees" from "authenticated";

revoke truncate on table "public"."employees" from "authenticated";

revoke update on table "public"."employees" from "authenticated";

revoke delete on table "public"."employees" from "service_role";

revoke insert on table "public"."employees" from "service_role";

revoke references on table "public"."employees" from "service_role";

revoke select on table "public"."employees" from "service_role";

revoke trigger on table "public"."employees" from "service_role";

revoke truncate on table "public"."employees" from "service_role";

revoke update on table "public"."employees" from "service_role";

revoke delete on table "public"."exam_status" from "anon";

revoke insert on table "public"."exam_status" from "anon";

revoke references on table "public"."exam_status" from "anon";

revoke select on table "public"."exam_status" from "anon";

revoke trigger on table "public"."exam_status" from "anon";

revoke truncate on table "public"."exam_status" from "anon";

revoke update on table "public"."exam_status" from "anon";

revoke delete on table "public"."exam_status" from "authenticated";

revoke insert on table "public"."exam_status" from "authenticated";

revoke references on table "public"."exam_status" from "authenticated";

revoke select on table "public"."exam_status" from "authenticated";

revoke trigger on table "public"."exam_status" from "authenticated";

revoke truncate on table "public"."exam_status" from "authenticated";

revoke update on table "public"."exam_status" from "authenticated";

revoke delete on table "public"."exam_status" from "service_role";

revoke insert on table "public"."exam_status" from "service_role";

revoke references on table "public"."exam_status" from "service_role";

revoke select on table "public"."exam_status" from "service_role";

revoke trigger on table "public"."exam_status" from "service_role";

revoke truncate on table "public"."exam_status" from "service_role";

revoke update on table "public"."exam_status" from "service_role";

revoke delete on table "public"."exam_types" from "anon";

revoke insert on table "public"."exam_types" from "anon";

revoke references on table "public"."exam_types" from "anon";

revoke select on table "public"."exam_types" from "anon";

revoke trigger on table "public"."exam_types" from "anon";

revoke truncate on table "public"."exam_types" from "anon";

revoke update on table "public"."exam_types" from "anon";

revoke delete on table "public"."exam_types" from "authenticated";

revoke insert on table "public"."exam_types" from "authenticated";

revoke references on table "public"."exam_types" from "authenticated";

revoke select on table "public"."exam_types" from "authenticated";

revoke trigger on table "public"."exam_types" from "authenticated";

revoke truncate on table "public"."exam_types" from "authenticated";

revoke update on table "public"."exam_types" from "authenticated";

revoke delete on table "public"."exam_types" from "service_role";

revoke insert on table "public"."exam_types" from "service_role";

revoke references on table "public"."exam_types" from "service_role";

revoke select on table "public"."exam_types" from "service_role";

revoke trigger on table "public"."exam_types" from "service_role";

revoke truncate on table "public"."exam_types" from "service_role";

revoke update on table "public"."exam_types" from "service_role";

revoke delete on table "public"."exams" from "anon";

revoke insert on table "public"."exams" from "anon";

revoke references on table "public"."exams" from "anon";

revoke select on table "public"."exams" from "anon";

revoke trigger on table "public"."exams" from "anon";

revoke truncate on table "public"."exams" from "anon";

revoke update on table "public"."exams" from "anon";

revoke delete on table "public"."exams" from "authenticated";

revoke insert on table "public"."exams" from "authenticated";

revoke references on table "public"."exams" from "authenticated";

revoke select on table "public"."exams" from "authenticated";

revoke trigger on table "public"."exams" from "authenticated";

revoke truncate on table "public"."exams" from "authenticated";

revoke update on table "public"."exams" from "authenticated";

revoke delete on table "public"."exams" from "service_role";

revoke insert on table "public"."exams" from "service_role";

revoke references on table "public"."exams" from "service_role";

revoke select on table "public"."exams" from "service_role";

revoke trigger on table "public"."exams" from "service_role";

revoke truncate on table "public"."exams" from "service_role";

revoke update on table "public"."exams" from "service_role";

revoke delete on table "public"."invoices" from "anon";

revoke insert on table "public"."invoices" from "anon";

revoke references on table "public"."invoices" from "anon";

revoke select on table "public"."invoices" from "anon";

revoke trigger on table "public"."invoices" from "anon";

revoke truncate on table "public"."invoices" from "anon";

revoke update on table "public"."invoices" from "anon";

revoke delete on table "public"."invoices" from "authenticated";

revoke insert on table "public"."invoices" from "authenticated";

revoke references on table "public"."invoices" from "authenticated";

revoke select on table "public"."invoices" from "authenticated";

revoke trigger on table "public"."invoices" from "authenticated";

revoke truncate on table "public"."invoices" from "authenticated";

revoke update on table "public"."invoices" from "authenticated";

revoke delete on table "public"."invoices" from "service_role";

revoke insert on table "public"."invoices" from "service_role";

revoke references on table "public"."invoices" from "service_role";

revoke select on table "public"."invoices" from "service_role";

revoke trigger on table "public"."invoices" from "service_role";

revoke truncate on table "public"."invoices" from "service_role";

revoke update on table "public"."invoices" from "service_role";

revoke delete on table "public"."join_ambulace_exam_type" from "anon";

revoke insert on table "public"."join_ambulace_exam_type" from "anon";

revoke references on table "public"."join_ambulace_exam_type" from "anon";

revoke select on table "public"."join_ambulace_exam_type" from "anon";

revoke trigger on table "public"."join_ambulace_exam_type" from "anon";

revoke truncate on table "public"."join_ambulace_exam_type" from "anon";

revoke update on table "public"."join_ambulace_exam_type" from "anon";

revoke delete on table "public"."join_ambulace_exam_type" from "authenticated";

revoke insert on table "public"."join_ambulace_exam_type" from "authenticated";

revoke references on table "public"."join_ambulace_exam_type" from "authenticated";

revoke select on table "public"."join_ambulace_exam_type" from "authenticated";

revoke trigger on table "public"."join_ambulace_exam_type" from "authenticated";

revoke truncate on table "public"."join_ambulace_exam_type" from "authenticated";

revoke update on table "public"."join_ambulace_exam_type" from "authenticated";

revoke delete on table "public"."join_ambulace_exam_type" from "service_role";

revoke insert on table "public"."join_ambulace_exam_type" from "service_role";

revoke references on table "public"."join_ambulace_exam_type" from "service_role";

revoke select on table "public"."join_ambulace_exam_type" from "service_role";

revoke trigger on table "public"."join_ambulace_exam_type" from "service_role";

revoke truncate on table "public"."join_ambulace_exam_type" from "service_role";

revoke update on table "public"."join_ambulace_exam_type" from "service_role";

revoke delete on table "public"."join_employee_exam" from "anon";

revoke insert on table "public"."join_employee_exam" from "anon";

revoke references on table "public"."join_employee_exam" from "anon";

revoke select on table "public"."join_employee_exam" from "anon";

revoke trigger on table "public"."join_employee_exam" from "anon";

revoke truncate on table "public"."join_employee_exam" from "anon";

revoke update on table "public"."join_employee_exam" from "anon";

revoke delete on table "public"."join_employee_exam" from "authenticated";

revoke insert on table "public"."join_employee_exam" from "authenticated";

revoke references on table "public"."join_employee_exam" from "authenticated";

revoke select on table "public"."join_employee_exam" from "authenticated";

revoke trigger on table "public"."join_employee_exam" from "authenticated";

revoke truncate on table "public"."join_employee_exam" from "authenticated";

revoke update on table "public"."join_employee_exam" from "authenticated";

revoke delete on table "public"."join_employee_exam" from "service_role";

revoke insert on table "public"."join_employee_exam" from "service_role";

revoke references on table "public"."join_employee_exam" from "service_role";

revoke select on table "public"."join_employee_exam" from "service_role";

revoke trigger on table "public"."join_employee_exam" from "service_role";

revoke truncate on table "public"."join_employee_exam" from "service_role";

revoke update on table "public"."join_employee_exam" from "service_role";

revoke delete on table "public"."join_patient_services" from "anon";

revoke insert on table "public"."join_patient_services" from "anon";

revoke references on table "public"."join_patient_services" from "anon";

revoke select on table "public"."join_patient_services" from "anon";

revoke trigger on table "public"."join_patient_services" from "anon";

revoke truncate on table "public"."join_patient_services" from "anon";

revoke update on table "public"."join_patient_services" from "anon";

revoke delete on table "public"."join_patient_services" from "authenticated";

revoke insert on table "public"."join_patient_services" from "authenticated";

revoke references on table "public"."join_patient_services" from "authenticated";

revoke select on table "public"."join_patient_services" from "authenticated";

revoke trigger on table "public"."join_patient_services" from "authenticated";

revoke truncate on table "public"."join_patient_services" from "authenticated";

revoke update on table "public"."join_patient_services" from "authenticated";

revoke delete on table "public"."join_patient_services" from "service_role";

revoke insert on table "public"."join_patient_services" from "service_role";

revoke references on table "public"."join_patient_services" from "service_role";

revoke select on table "public"."join_patient_services" from "service_role";

revoke trigger on table "public"."join_patient_services" from "service_role";

revoke truncate on table "public"."join_patient_services" from "service_role";

revoke update on table "public"."join_patient_services" from "service_role";

revoke delete on table "public"."profession_type" from "anon";

revoke insert on table "public"."profession_type" from "anon";

revoke references on table "public"."profession_type" from "anon";

revoke select on table "public"."profession_type" from "anon";

revoke trigger on table "public"."profession_type" from "anon";

revoke truncate on table "public"."profession_type" from "anon";

revoke update on table "public"."profession_type" from "anon";

revoke delete on table "public"."profession_type" from "authenticated";

revoke insert on table "public"."profession_type" from "authenticated";

revoke references on table "public"."profession_type" from "authenticated";

revoke select on table "public"."profession_type" from "authenticated";

revoke trigger on table "public"."profession_type" from "authenticated";

revoke truncate on table "public"."profession_type" from "authenticated";

revoke update on table "public"."profession_type" from "authenticated";

revoke delete on table "public"."profession_type" from "service_role";

revoke insert on table "public"."profession_type" from "service_role";

revoke references on table "public"."profession_type" from "service_role";

revoke select on table "public"."profession_type" from "service_role";

revoke trigger on table "public"."profession_type" from "service_role";

revoke truncate on table "public"."profession_type" from "service_role";

revoke update on table "public"."profession_type" from "service_role";

revoke delete on table "public"."referrals" from "anon";

revoke insert on table "public"."referrals" from "anon";

revoke references on table "public"."referrals" from "anon";

revoke select on table "public"."referrals" from "anon";

revoke trigger on table "public"."referrals" from "anon";

revoke truncate on table "public"."referrals" from "anon";

revoke update on table "public"."referrals" from "anon";

revoke delete on table "public"."referrals" from "authenticated";

revoke insert on table "public"."referrals" from "authenticated";

revoke references on table "public"."referrals" from "authenticated";

revoke select on table "public"."referrals" from "authenticated";

revoke trigger on table "public"."referrals" from "authenticated";

revoke truncate on table "public"."referrals" from "authenticated";

revoke update on table "public"."referrals" from "authenticated";

revoke delete on table "public"."referrals" from "service_role";

revoke insert on table "public"."referrals" from "service_role";

revoke references on table "public"."referrals" from "service_role";

revoke select on table "public"."referrals" from "service_role";

revoke trigger on table "public"."referrals" from "service_role";

revoke truncate on table "public"."referrals" from "service_role";

revoke update on table "public"."referrals" from "service_role";

revoke delete on table "public"."reports" from "anon";

revoke insert on table "public"."reports" from "anon";

revoke references on table "public"."reports" from "anon";

revoke select on table "public"."reports" from "anon";

revoke trigger on table "public"."reports" from "anon";

revoke truncate on table "public"."reports" from "anon";

revoke update on table "public"."reports" from "anon";

revoke delete on table "public"."reports" from "authenticated";

revoke insert on table "public"."reports" from "authenticated";

revoke references on table "public"."reports" from "authenticated";

revoke select on table "public"."reports" from "authenticated";

revoke trigger on table "public"."reports" from "authenticated";

revoke truncate on table "public"."reports" from "authenticated";

revoke update on table "public"."reports" from "authenticated";

revoke delete on table "public"."reports" from "service_role";

revoke insert on table "public"."reports" from "service_role";

revoke references on table "public"."reports" from "service_role";

revoke select on table "public"."reports" from "service_role";

revoke trigger on table "public"."reports" from "service_role";

revoke truncate on table "public"."reports" from "service_role";

revoke update on table "public"."reports" from "service_role";

revoke delete on table "public"."services" from "anon";

revoke insert on table "public"."services" from "anon";

revoke references on table "public"."services" from "anon";

revoke select on table "public"."services" from "anon";

revoke trigger on table "public"."services" from "anon";

revoke truncate on table "public"."services" from "anon";

revoke update on table "public"."services" from "anon";

revoke delete on table "public"."services" from "authenticated";

revoke insert on table "public"."services" from "authenticated";

revoke references on table "public"."services" from "authenticated";

revoke select on table "public"."services" from "authenticated";

revoke trigger on table "public"."services" from "authenticated";

revoke truncate on table "public"."services" from "authenticated";

revoke update on table "public"."services" from "authenticated";

revoke delete on table "public"."services" from "service_role";

revoke insert on table "public"."services" from "service_role";

revoke references on table "public"."services" from "service_role";

revoke select on table "public"."services" from "service_role";

revoke trigger on table "public"."services" from "service_role";

revoke truncate on table "public"."services" from "service_role";

revoke update on table "public"."services" from "service_role";

revoke delete on table "public"."sessions" from "anon";

revoke insert on table "public"."sessions" from "anon";

revoke references on table "public"."sessions" from "anon";

revoke select on table "public"."sessions" from "anon";

revoke trigger on table "public"."sessions" from "anon";

revoke truncate on table "public"."sessions" from "anon";

revoke update on table "public"."sessions" from "anon";

revoke delete on table "public"."sessions" from "authenticated";

revoke insert on table "public"."sessions" from "authenticated";

revoke references on table "public"."sessions" from "authenticated";

revoke select on table "public"."sessions" from "authenticated";

revoke trigger on table "public"."sessions" from "authenticated";

revoke truncate on table "public"."sessions" from "authenticated";

revoke update on table "public"."sessions" from "authenticated";

revoke delete on table "public"."sessions" from "service_role";

revoke insert on table "public"."sessions" from "service_role";

revoke references on table "public"."sessions" from "service_role";

revoke select on table "public"."sessions" from "service_role";

revoke trigger on table "public"."sessions" from "service_role";

revoke truncate on table "public"."sessions" from "service_role";

revoke update on table "public"."sessions" from "service_role";

alter table "public"."ambulances" drop constraint "ambulances_company_fkey";

alter table "public"."ambulances" drop constraint "ambulances_created_by_fkey";

alter table "public"."ambulances" drop constraint "ambulances_name_key";

alter table "public"."ambulances" drop constraint "ambulances_updated_by_fkey";

alter table "public"."companies" drop constraint "companies_created_by_fkey";

alter table "public"."companies" drop constraint "companies_register_num_key";

alter table "public"."companies" drop constraint "companies_updated_by_fkey";

alter table "public"."employee_documents" drop constraint "employee_documents_created_by_fkey";

alter table "public"."employee_documents" drop constraint "employee_documents_document_type_fkey";

alter table "public"."employee_documents" drop constraint "employee_documents_updated_by_fkey";

alter table "public"."employee_type" drop constraint "employee_type_created_by_fkey";

alter table "public"."employee_type" drop constraint "employee_type_updated_by_fkey";

alter table "public"."employee_type" drop constraint "employee_type_value_key";

alter table "public"."employees" drop constraint "employees_auth_id_fkey";

alter table "public"."employees" drop constraint "employees_created_by_fkey";

alter table "public"."employees" drop constraint "employees_document_id_key";

alter table "public"."employees" drop constraint "employees_updated_by_fkey";

alter table "public"."employees" drop constraint "employees_vocation_fkey";

alter table "public"."exam_status" drop constraint "exam_status_created_by_fkey";

alter table "public"."exam_status" drop constraint "exam_status_updated_by_fkey";

alter table "public"."exam_status" drop constraint "exam_status_value_key";

alter table "public"."exam_types" drop constraint "exam_types_created_by_fkey";

alter table "public"."exam_types" drop constraint "exam_types_updated_by_fkey";

alter table "public"."exam_types" drop constraint "exam_types_value_key";

alter table "public"."exams" drop constraint "exams_created_by_fkey";

alter table "public"."exams" drop constraint "exams_employee_fkey";

alter table "public"."exams" drop constraint "exams_exam_type_fkey";

alter table "public"."exams" drop constraint "exams_info_fkey";

alter table "public"."exams" drop constraint "exams_patient_fkey";

alter table "public"."exams" drop constraint "exams_updated_by_fkey";

alter table "public"."invoices" drop constraint "invoices_created_by_fkey";

alter table "public"."invoices" drop constraint "invoices_emplyee_id_fkey";

alter table "public"."invoices" drop constraint "invoices_patient_id_fkey";

alter table "public"."invoices" drop constraint "invoices_updated_by_fkey";

alter table "public"."join_ambulace_exam_type" drop constraint "join_ambulace_exam_type_abulance_id_fkey";

alter table "public"."join_ambulace_exam_type" drop constraint "join_ambulace_exam_type_exam_type_id_fkey";

alter table "public"."join_ambulace_exam_type" drop constraint "juncion_ambulace_exam_created_by_fkey";

alter table "public"."join_employee_exam" drop constraint "junction_employee_exam_created_by_fkey";

alter table "public"."join_employee_exam" drop constraint "junction_employee_exam_employee_id_fkey";

alter table "public"."join_employee_exam" drop constraint "junction_employee_exam_exam_id_fkey";

alter table "public"."join_employee_exam" drop constraint "junction_employee_exam_updated_by_fkey";

alter table "public"."join_patient_services" drop constraint "junction_patient_services_invoice_id_fkey";

alter table "public"."join_patient_services" drop constraint "junction_patient_services_patient_id_fkey";

alter table "public"."join_patient_services" drop constraint "junction_patient_services_service_id_fkey";

alter table "public"."profession_type" drop constraint "profession_type_created_by_fkey";

alter table "public"."profession_type" drop constraint "profession_type_updated_by_fkey";

alter table "public"."referrals" drop constraint "referrals_created_by_fkey";

alter table "public"."referrals" drop constraint "referrals_employe_id_fkey";

alter table "public"."referrals" drop constraint "referrals_patient_id_fkey";

alter table "public"."referrals" drop constraint "referrals_report_id_fkey";

alter table "public"."referrals" drop constraint "referrals_updated_by_fkey";

alter table "public"."reports" drop constraint "reports_created_by_fkey";

alter table "public"."reports" drop constraint "reports_exam_type_fkey";

alter table "public"."reports" drop constraint "reports_patient_id_fkey";

alter table "public"."reports" drop constraint "reports_updated_by_fkey";

alter table "public"."services" drop constraint "services_created_by_fkey";

alter table "public"."services" drop constraint "services_updated_by_fkey";

alter table "public"."sessions" drop constraint "sessions_user_id_fkey";

alter table "public"."ambulances" drop constraint "ambulances_pkey";

alter table "public"."companies" drop constraint "companies_pkey";

alter table "public"."drug_register_me" drop constraint "drug_register_pkey";

alter table "public"."drug_register_sr" drop constraint "drug_register_sr_pkey";

alter table "public"."employee_documents" drop constraint "employee_documents_pkey";

alter table "public"."employee_type" drop constraint "add_emplyee_pkey";

alter table "public"."employees" drop constraint "employees_pkey";

alter table "public"."exam_status" drop constraint "exam_status_pkey";

alter table "public"."exam_types" drop constraint "exam_types_pkey";

alter table "public"."exams" drop constraint "exams_pkey";

alter table "public"."invoices" drop constraint "invoices_pkey";

alter table "public"."join_ambulace_exam_type" drop constraint "juncion_ambulace_exam_pkey";

alter table "public"."join_employee_exam" drop constraint "junction_employee_exam_pkey";

alter table "public"."join_patient_services" drop constraint "junction_patient_services_pkey";

alter table "public"."profession_type" drop constraint "profession_type_pkey";

alter table "public"."referrals" drop constraint "referrals_pkey";

alter table "public"."reports" drop constraint "reports_pkey";

alter table "public"."services" drop constraint "services_pkey";

alter table "public"."sessions" drop constraint "sessions_pkey";

drop index if exists "public"."add_emplyee_pkey";

drop index if exists "public"."ambulances_name_key";

drop index if exists "public"."ambulances_pkey";

drop index if exists "public"."companies_pkey";

drop index if exists "public"."companies_register_num_key";

drop index if exists "public"."drug_register_sr_pkey";

drop index if exists "public"."employee_documents_pkey";

drop index if exists "public"."employee_type_value_key";

drop index if exists "public"."employees_document_id_key";

drop index if exists "public"."employees_pkey";

drop index if exists "public"."exam_status_pkey";

drop index if exists "public"."exam_status_value_key";

drop index if exists "public"."exam_types_pkey";

drop index if exists "public"."exam_types_value_key";

drop index if exists "public"."exams_pkey";

drop index if exists "public"."invoices_pkey";

drop index if exists "public"."juncion_ambulace_exam_pkey";

drop index if exists "public"."junction_employee_exam_pkey";

drop index if exists "public"."junction_patient_services_pkey";

drop index if exists "public"."profession_type_pkey";

drop index if exists "public"."referrals_pkey";

drop index if exists "public"."reports_pkey";

drop index if exists "public"."services_pkey";

drop index if exists "public"."sessions_pkey";

drop index if exists "public"."drug_register_pkey";

drop table "public"."ambulances";

drop table "public"."companies";

drop table "public"."drug_register_me";

drop table "public"."drug_register_sr";

drop table "public"."employee_documents";

drop table "public"."employee_type";

drop table "public"."employees";

drop table "public"."exam_status";

drop table "public"."exam_types";

drop table "public"."exams";

drop table "public"."invoices";

drop table "public"."join_ambulace_exam_type";

drop table "public"."join_employee_exam";

drop table "public"."join_patient_services";

drop table "public"."profession_type";

drop table "public"."referrals";

drop table "public"."reports";

drop table "public"."services";

drop table "public"."sessions";


  create table "public"."drug_register" (
    "id" bigint generated by default as identity not null,
    "atc" character varying,
    "inn" character varying,
    "drug_name" character varying,
    "description" text,
    "regime" character varying,
    "license_number" character varying,
    "license_date" date,
    "producer" character varying,
    "license_holder" character varying
      );


alter table "public"."drug_register" enable row level security;

CREATE UNIQUE INDEX drug_register_pkey ON public.drug_register USING btree (id);

alter table "public"."drug_register" add constraint "drug_register_pkey" PRIMARY KEY using index "drug_register_pkey";

grant delete on table "public"."drug_register" to "anon";

grant insert on table "public"."drug_register" to "anon";

grant references on table "public"."drug_register" to "anon";

grant select on table "public"."drug_register" to "anon";

grant trigger on table "public"."drug_register" to "anon";

grant truncate on table "public"."drug_register" to "anon";

grant update on table "public"."drug_register" to "anon";

grant delete on table "public"."drug_register" to "authenticated";

grant insert on table "public"."drug_register" to "authenticated";

grant references on table "public"."drug_register" to "authenticated";

grant select on table "public"."drug_register" to "authenticated";

grant trigger on table "public"."drug_register" to "authenticated";

grant truncate on table "public"."drug_register" to "authenticated";

grant update on table "public"."drug_register" to "authenticated";

grant delete on table "public"."drug_register" to "service_role";

grant insert on table "public"."drug_register" to "service_role";

grant references on table "public"."drug_register" to "service_role";

grant select on table "public"."drug_register" to "service_role";

grant trigger on table "public"."drug_register" to "service_role";

grant truncate on table "public"."drug_register" to "service_role";

grant update on table "public"."drug_register" to "service_role";


  create policy "CRUD for users"
  on "public"."drug_register"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "DEV-ONLY: Allow all authenticated users full access to insuranc"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'patient-insurances'::text) AND (auth.role() = 'authenticated'::text)))
with check (((bucket_id = 'patient-insurances'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "DEV-ONLY: Allow all authenticated users full access"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'patient-id-documents'::text) AND (auth.role() = 'authenticated'::text)))
with check (((bucket_id = 'patient-id-documents'::text) AND (auth.role() = 'authenticated'::text)));



