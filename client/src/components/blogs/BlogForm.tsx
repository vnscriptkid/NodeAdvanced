import _ from "lodash";
import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Link } from "react-router-dom";
import { BlogField } from "./BlogField.tsx";
import formFields from "./formFields.ts";
import { RichTechComposer } from "../../composer/RichTextComposer.tsx";

class BlogForm extends Component<any, any> {
  renderFields() {
    return _.map(formFields, ({ label, name, disabled }) => {
      return (
        <Field
          key={name}
          component={BlogField}
          type="text"
          label={label}
          name={name}
          props={{ disabled }}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.props.handleSubmit(this.props.onBlogSubmit)}>
          <div>
            <h2>Markdown Post</h2>
            {this.renderFields()}
            <RichTechComposer
              onChange={(value) => {
                this.props.change("content", JSON.stringify(value));
              }}
              content={this.props.formValues?.content}
            />
          </div>
          <Link to="/blogs" className="red btn-flat white-text">
            Cancel
          </Link>
          <button type="submit" className="teal btn-flat right white-text">
            Next
            <i className="material-icons right">done</i>
          </button>
        </form>
      </div>
    );
  }
}

function validate(values) {
  const errors = {};

  _.each(formFields, ({ name }) => {
    if (!values[name]) {
      errors[name] = "You must provide a value";
    }
  });

  return errors;
}

export default reduxForm({
  validate,
  form: "blogForm",
  destroyOnUnmount: false,
})(BlogForm);
