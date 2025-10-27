"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import React from "react";
import outputs from "../../../amplify_outputs.json";
import { Amplify } from "aws-amplify";

Amplify.configure(
  outputs,
  {
    ssr: true,
  }
);
const AuthClient =
  ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    return (
      <Authenticator.Provider>
        {
          children
        }
      </Authenticator.Provider>
    );
  };

export default AuthClient;
