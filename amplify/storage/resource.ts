import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name:"extractPDFBucket",
  
  access: (allow) =>({
   'pdf/*': [
      allow.authenticated.to(['read','write','delete']),
    ]

  })
});

