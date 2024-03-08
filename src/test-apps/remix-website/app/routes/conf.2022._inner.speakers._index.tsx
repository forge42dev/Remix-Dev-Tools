import { redirect } from "@remix-run/node";

export const loader = () => redirect("/conf/2022#speakers");
