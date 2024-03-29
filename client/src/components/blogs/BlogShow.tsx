import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchBlog } from "../../actions";
import { RichTechComposer } from "../../composer/RichTextComposer.tsx";

class BlogShow extends Component<any, any> {
  componentDidMount() {
    this.props.fetchBlog(this.props.match.params._id);
  }

  render() {
    if (!this.props.blog) {
      return "";
    }

    const { title, content } = this.props.blog;

    return (
      <div>
        <h3>{title}</h3>
        {/* <p>{content}</p> */}
        <RichTechComposer content={content} editable={false} />
      </div>
    );
  }
}

function mapStateToProps({ blogs }, ownProps) {
  return { blog: blogs[ownProps.match.params._id] };
}

export default connect(mapStateToProps, { fetchBlog })(BlogShow);
