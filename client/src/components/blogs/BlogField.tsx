import React from "react";

export const BlogField = (props: any) => {
  const {
    input,
    label,
    meta: { error, touched },
    disabled,
  } = props;

  return (
    <div className={input.name}>
      <label>{label}</label>
      <input {...input} style={{ marginBottom: "5px" }} disabled={disabled} />
      <div className="red-text" style={{ marginBottom: "20px" }}>
        {touched && error}
      </div>
    </div>
  );
};
