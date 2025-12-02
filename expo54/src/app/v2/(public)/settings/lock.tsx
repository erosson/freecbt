import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action } from "@/src/model";
import { LockForm } from "@/src/view/auth-gateway";
import { Redirect } from "expo-router";
import React, { useState } from "react";

export default function Lock(): React.JSX.Element {
  return <LoadModel ready={Ready} />;
}

interface LockUpdateForm {
  code: string;
  confirm: string;
  status: "enter" | "confirm" | "done";
}

function emptyForm(): LockUpdateForm {
  return { code: "", confirm: "", status: "enter" };
}
function Ready({ model, dispatch, translate: t, style: s }: ModelLoadedProps) {
  const [form, setForm] = useState(emptyForm());
  // const nav = useRouter();
  // nav.prefetch(Routes.settingsV2());
  function onSubmit() {
    switch (form.status) {
      case "enter": {
        if (/^[0-9]{4}$/.test(form.code)) {
          // code is valid, now confirm it
          // TODO: model should probably check the above too
          setForm({ code: form.code, confirm: "", status: "confirm" });
        } else {
          // invalid code, reset and try again
          setForm(emptyForm());
        }
        return;
      }
      case "confirm": {
        if (form.code === form.confirm) {
          // success: set pincode and redirect
          dispatch(Action.setPincode(form.code));
          setForm({ ...emptyForm(), status: "done" });
        } else {
          // mismatch: reset and try again
          setForm(emptyForm());
        }
        return;
      }
      case "done": {
        return;
      }
      default:
        throw new Error(
          `unknown lock-form status: ${form.status satisfies never}`
        );
    }
  }
  switch (form.status) {
    case "enter": {
      return (
        <LockForm
          style={s}
          header={t("lock_screen.update")}
          value={form.code}
          setValue={(code) => setForm({ ...form, code })}
          onSubmit={onSubmit}
        />
      );
    }
    case "confirm": {
      return (
        <LockForm
          style={s}
          header={t("lock_screen.confirm")}
          value={form.confirm}
          setValue={(confirm) => setForm({ ...form, confirm })}
          onSubmit={onSubmit}
        />
      );
    }
    case "done": {
      return <Redirect href={Routes.settingsV2()} />;
    }
    default:
      throw new Error(
        `unknown lock-form status: ${form.status satisfies never}`
      );
  }
}
