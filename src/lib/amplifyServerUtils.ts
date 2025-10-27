import { createServerRunner, NextServer } from "@aws-amplify/adapter-nextjs";
import outputs from "../../amplify_outputs.json";
import { fetchAuthSession, fetchUserAttributes} from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "../../amplify/data/resource";


export const {
  runWithAmplifyServerContext,
} =
  createServerRunner(
    {
      config:
        outputs,
    }
  );


export async function authenticatedUser(context:NextServer.Context){
  return await runWithAmplifyServerContext({
    nextServerContext:context,
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        if(!session.tokens){
          return;
        }
        return session;
      } catch (error) {
        console.log("error",error);
        return;
      }
    }
  })
}


export const getUserDetails =
  async () => {
    try {
      const userDetails =
        await runWithAmplifyServerContext(
          {
            nextServerContext:
              {
                cookies,
              },
            operation:
              (
                context
              ) =>
                fetchUserAttributes(
                  context
                ),
          }
        );
      return userDetails;
    } catch (error) {
      console.log(
        "errr",
        error
      );
      return false;
    }
  };

export const cookieBasedClient =
  generateServerClientUsingCookies<Schema>(
    {
      config:
        outputs,
      cookies,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
