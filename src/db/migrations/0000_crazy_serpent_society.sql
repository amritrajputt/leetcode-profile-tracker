CREATE TABLE "daily_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"date" date NOT NULL,
	"lc_total" integer DEFAULT 0,
	"gfg_total" integer DEFAULT 0,
	"lc_week_total" integer DEFAULT 0,
	"lc_month_total" integer DEFAULT 0,
	"lc_year_total" integer DEFAULT 0,
	"gfg_week_total" integer DEFAULT 0,
	"gfg_month_total" integer DEFAULT 0,
	"gfg_year_total" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(130) NOT NULL,
	"password" text NOT NULL,
	"name" varchar(60) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "faculty_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"roll_number" varchar(25) NOT NULL,
	"batch_year" integer NOT NULL,
	"email" varchar(130) NOT NULL,
	"course" varchar(50) NOT NULL,
	"branch" varchar(50) NOT NULL,
	"section" varchar(1) NOT NULL,
	"leetcode_username" varchar(120),
	"geeksforgeeks_username" varchar(120),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "students_roll_number_unique" UNIQUE("roll_number"),
	CONSTRAINT "students_email_unique" UNIQUE("email"),
	CONSTRAINT "students_leetcode_username_unique" UNIQUE("leetcode_username"),
	CONSTRAINT "students_geeksforgeeks_username_unique" UNIQUE("geeksforgeeks_username"),
	CONSTRAINT "at_least_one_profile_check" CHECK ("students"."leetcode_username" IS NOT NULL OR "students"."geeksforgeeks_username" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "daily_snapshots" ADD CONSTRAINT "daily_snapshots_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;