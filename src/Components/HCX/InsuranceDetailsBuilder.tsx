import {
  FieldChangeEvent,
  FormFieldBaseProps,
  useFormFieldPropsResolver,
} from "../Form/FormFields/Utils";
import FormField, { FieldLabel } from "../Form/FormFields/FormField";
import { HCXPolicyModel } from "./models";
import ButtonV2 from "../Common/components/ButtonV2";
import CareIcon from "../../CAREUI/icons/CareIcon";
import TextFormField from "../Form/FormFields/TextFormField";
import { useDispatch } from "react-redux";
import { HCXActions } from "../../Redux/actions";
import { classNames } from "../../Utils/utils";
import InsurerAutocomplete from "./InsurerAutocomplete";

type Props = FormFieldBaseProps<HCXPolicyModel[]> & { gridView?: boolean };

export default function InsuranceDetailsBuilder(props: Props) {
  const field = useFormFieldPropsResolver(props as any);
  const dispatch = useDispatch<any>();

  const handleUpdate = (index: number) => {
    return (event: FieldChangeEvent<unknown>) => {
      field.handleChange(
        (props.value || [])?.map((obj, i) =>
          i === index ? { ...obj, [event.name]: event.value } : obj
        )
      );
    };
  };

  const handleUpdates = (index: number) => {
    return (diffs: object) => {
      field.handleChange(
        (props.value || [])?.map((obj, i) =>
          i === index ? { ...obj, ...diffs } : obj
        )
      );
    };
  };

  const handleRemove = (index: number) => {
    return () => {
      field.handleChange(
        (props.value || [])?.filter((obj, i) => {
          if (obj.id && i === index) {
            dispatch(HCXActions.policies.delete(obj.id));
          }
          return i !== index;
        })
      );
    };
  };

  return (
    <FormField field={field}>
      <div className="flex flex-col gap-3">
        {props.value?.map((policy, index) => (
          <InsuranceDetailEditCard
            key={index}
            policy={policy}
            handleUpdate={handleUpdate(index)}
            handleUpdates={handleUpdates(index)}
            handleRemove={handleRemove(index)}
            gridView={props.gridView}
          />
        ))}
      </div>
    </FormField>
  );
}

const InsuranceDetailEditCard = ({
  policy,
  handleUpdate,
  handleUpdates,
  handleRemove,
  gridView,
}: {
  policy: HCXPolicyModel;
  handleUpdate: (event: FieldChangeEvent<unknown>) => void;
  handleUpdates: (diffs: object) => void;
  handleRemove: () => void;
  gridView?: boolean;
}) => {
  const seletedInsurer =
    policy.insurer_id || policy.insurer_name
      ? { code: policy.insurer_id, name: policy.insurer_name }
      : undefined;

  return (
    <div className="border-2 border-gray-200 border-dashed p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <FieldLabel className="!font-bold my-auto">Policy</FieldLabel>
        <ButtonV2 variant="danger" type="button" ghost onClick={handleRemove}>
          Delete
          <CareIcon className="care-l-trash-alt text-lg" />
        </ButtonV2>
      </div>

      <div
        className={classNames(
          "p-2",
          gridView
            ? "grid gap-x-8 gap-y-2 grid-cols-1 md:grid-cols-2"
            : "flex flex-col gap-2"
        )}
      >
        <TextFormField
          required
          name="subscriber_id"
          label="Medical ID"
          placeholder="Eg. SUB001"
          value={policy.subscriber_id}
          onChange={handleUpdate}
        />
        <TextFormField
          required
          name="policy_id"
          label="Policy ID"
          placeholder="Eg. P001"
          value={policy.policy_id}
          onChange={handleUpdate}
        />
        <InsurerAutocomplete
          required
          name="insurer_"
          label="Insurer"
          placeholder="Eg. GICOFINDIA"
          value={seletedInsurer}
          onChange={({ value }) =>
            handleUpdates({
              insurer_id: value.code,
              insurer_name: value.name,
            })
          }
        />
      </div>
    </div>
  );
};