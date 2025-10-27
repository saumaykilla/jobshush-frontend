import React from 'react'
import { Label } from '../ui/label'
import { get, useFieldArray, useFormContext } from 'react-hook-form'
import { Input } from '../ui/input'
import Editor from '../ui/rich-text/editor'
import { Plus, Trash2} from 'lucide-react'
import { Card ,CardContent} from '../ui/card'
import { Button } from '../ui/button'
import { ProfileType } from '@/lib/schemas/ProfileSchema'

const RoleDetails = () => {
    const { register, control, formState: { errors },watch,setValue } = useFormContext<ProfileType>()
    const {fields,append,remove} = useFieldArray({control:control,name:'roleDetails.additionalLinks'})
  return (

    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <div>
          <Editor
            placeholder="Write your summary here..."
            content={watch("roleDetails.summary")}
            onChange={(
              value: string
            ) => {
              setValue(
                "roleDetails.summary",
                value
              );
            }}
          />
        </div>
      </div>

      <div className="grid gap-2">
      <div className="flex items-center justify-between">

        <Label htmlFor="linkedIn">LinkedIn URL</Label>
        {errors
            ?.roleDetails
            ?.linkedInURL && (
            <span className="text-red-500 text-xs">
              {
                errors
                  ?.roleDetails
                  ?.linkedInURL
                  ?.message
              }
            </span>
          )}
          </div>
        <Input
          id="linkedIn"
          type="url"
         {...register('roleDetails.linkedInURL')}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Additional Links</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={()=>append({label:'',url:''})}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>

        {fields?.map((link, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between space-x-2">
                  <Label>Link {index + 1}</Label>
                  {get(errors, `roleDetails.additionalLinks.${index}.label`) || get(errors, `roleDetails.additionalLinks.${index}.url`)
                           && (
                          <span className="text-red-500 text-xs">
                            Label & URL is required
                          </span>
                        )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                  {...register(`roleDetails.additionalLinks.${index}.label`)}
                    placeholder="Label (e.g., Portfolio)"
                  />
                  <Input
                    {...register(`roleDetails.additionalLinks.${index}.url`)}
                    placeholder="URL"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
 
  )
}

export default RoleDetails