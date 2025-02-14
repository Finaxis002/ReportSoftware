import React, { useEffect, useState } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const InfoDetails = ({ handleSave }) => {
    const [editorHtml, setEditorHtml] = useState('');
    const [theme, setTheme] = useState('snow');
    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
    ]
    const modules = {
        "toolbar": [
            [
                {
                    "header": "1"
                },
                {
                    "header": "2"
                },
                {
                    "font": []
                }
            ],
            [
                {
                    "size": []
                }
            ],
            [
                "bold",
                "italic",
                "underline",
                "strike",
                "blockquote"
            ],
            [
                {
                    "list": "ordered"
                },
                {
                    "list": "bullet"
                },
                {
                    "indent": "-1"
                },
                {
                    "indent": "+1"
                }
            ],
            [
                "link",
                "image",
            ],
            [
                "clean"
            ]
        ],
        "clipboard": {
            "matchVisual": false
        }
    }
    useEffect(() => {
        console.log(editorHtml);
    }, [editorHtml])
    const submit = () => {
        handleSave({
            InfoDetails: editorHtml
        })
    }
    return (
        <div>

            <div class="row">
                <div class="col-md-4">
                    <button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-whatever="@Component 1">
                        <div class="card card-1 py-4">
                            <h3>Component 1</h3>
                            <p>A curated set of   ES5/ES6/TypeScript wrappers for plugins to easily add any native functionality to your Ionic apps.</p>
                        </div>
                    </button>
                </div>
                <div class="col-md-4">
                    <div class="card card-2 py-4">
                        <h3>UI Components</h3>
                        <p>Tabs, buttons, inputs, lists, cards, and more! A comprehensive library
                            of mobile UI components, ready to go.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card card-3 py-4">
                        <h3>Theming</h3>
                        <p>Learn how to easily customize and modify your app’s design to fit your
                            brand across all mobile platform styles.</p>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <button className='btn btn-success px-5 mt-2' onClick={submit}>Save</button>
            </div>

            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel">New message</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div class="mb-3">
                                    <label for="recipient-name" class="col-form-label">Recipient:</label>
                                    <input type="text" class="form-control" id="recipient-name" />
                                </div>
                                < ReactQuill theme={theme}
                                    modules={modules}
                                    formats={formats}
                                    value={editorHtml} onChange={setEditorHtml}
                                    style={{ height: "60vh" }}
                                />
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary">Send message</button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default InfoDetails