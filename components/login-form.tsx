"use client";

import Image from "next/image";
import loginImg from "@/public/sing-in.jpg";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Spinner } from "./spinner";
import { signInAction } from "@/lib/auth-actions";

export const loginFormSchema = z.object({
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export type LoginFormType = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const t = useTranslations("Auth.LoginForm");

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormType) {
    await signInAction(values);
  }

  return (
    <Card className="overflow-hidden p-0 w-full">
      <CardContent className="grid p-0 md:grid-cols-2 ">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 items-center text-center">
                <h1 className="text-3xl font-bold">{t("title")}</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  {t("subtitle")}
                </p>
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("emailPlaceholder")}
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("passwordPlaceholder")}
                        {...field}
                        autoComplete="current-password"
                        type="password"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center justify-center gap-1">
                    <Spinner size="small" />
                    <p>{t("loginPending")}</p>
                  </div>
                ) : (
                  <p>{t("login")}</p>
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="relative hidden bg-muted md:block">
          <Image
            src={loginImg}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] dark:invert"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
}
