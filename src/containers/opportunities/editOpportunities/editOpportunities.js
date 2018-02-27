import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Dropdown from 'react-dropdown-multiselect'
import 'react-dropdown-multiselect/style.css';
import ReactGoogleMapLoader from "react-google-maps-loader";
import ReactGooglePlacesSuggest from "react-google-places-suggest";
const MY_API_KEY = "AIzaSyDdYuBPvFBBLBwWOGpGabdGCkF-nphgdMo"
class ViewOpportunities extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], startDate: moment(), search: "",
            value: ""
        };
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        this.moment = moment;
        this.handleChange = this.handleChange.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.handleCancelClick = this.handleCancelClick.bind(this);
    }

    handleInputChange = e => {
        this.setState({ search: e.target.value, value: e.target.value,data:{...this.state.data,city:e.target.value} })
    }

    handleSelectSuggest = (geocodedPrediction, originalPrediction) => {
        console.log(geocodedPrediction, originalPrediction) // eslint-disable-line
        this.setState({ search: "", value: geocodedPrediction.formatted_address, data: { ...this.state.data, city: geocodedPrediction.formatted_address } })
    }

    updateData = function (page) {
        let id = this.props.match.params.id;
        var self = this;
        var dataDisp = [];
        axios.get('http://gisapi-web-staging-1636833739.eu-west-1.elb.amazonaws.com/v2/opportunities/' + id + '?access_token=dd0df21c8af5d929dff19f74506c4a8153d7acd34306b9761fd4a57cfa1d483c')
            .then(function (response) {
                console.log(response);
                let x = response.data;
                let data = {};
                data.id = x.id;
                data.title = x.title;
                data.applications_close_date = self.moment(x.applications_close_date);
                data.earliest_start_date = self.moment(x.earliest_start_date);
                data.latest_end_date = self.moment(data.latest_end_date);
                data.description = response.data.description;
                data.backgrounds = response.data.backgrounds.map(x => x.name).join();
                data.skills = response.data.skills.map(x => x.name).join();
                data.selection_process = response.data.role_info.selection_process;
                data.salary = response.data.specifics_info.salary;
                data.city = response.data.role_info.city;
                self.setState((prevState, props) => ({
                    data: data,
                    fullData: response.data
                }))
            })
            .catch(function (error) {
                console.log(error);
            });

        axios.get('http://gisapi-web-staging-1636833739.eu-west-1.elb.amazonaws.com/v2/lists/backgrounds?access_token=dd0df21c8af5d929dff19f74506c4a8153d7acd34306b9761fd4a57cfa1d483c')
            .then(function (response) {
                self.setState({
                    options: response.data.map(x => { return { value: x.name, label: x.name } })
                })
            })
    }

    handleSaveClick(event) {
        this.setState({
            fullData: { ...this.state.fullData, ...this.state.data }
        })
        axios.patch('http://gisapi-web-staging-1636833739.eu-west-1.elb.amazonaws.com/v2/opportunities/' + this.props.match.params.id+"?access_token=dd0df21c8af5d929dff19f74506c4a8153d7acd34306b9761fd4a57cfa1d483c",{
            "opportunity":{
                "title":this.state.data.title,
                "applications_close_date":this.state.data.applications_close_date,
                "earliest_start_date":this.state.data.earliest_start_date,
                "latest_end_date":this.state.data.latest_end_date,
                "desciption":this.state.data.desciption,
                // "backgrounds":this.state.data.backgrounds.split(','),
                // "skills":this.state.data.skills.split(','),
                "role_info":{
                    "selection_process":this.state.data.selection_process,
                    "city":this.state.data.city
                },
                "specifics_info":{
                    "salary":this.state.data.salary
                }
            }
        })
    }
    handleCancelClick(event) {
        this.props.history.push({
            pathname: '/'
        })
    }
    handleChange(event) {
        console.log(event)
        if (event.target.id == "title" && event.target.value.length > 100) {
            alert("title length cannot more than 100");
            return;
        }
        this.setState({
            data: { ...this.state.data, [event.target.id]: event.target.value }
        });
    }
    handleDateChange(event, date) {
        console.log(event, date);
        var initial = moment(date._i);
        initial = moment();
        var final = moment(date._d);
        var diff = final.diff(initial, 'day');
        if (event == "applications_close_date" && (diff < 30 || diff > 90)) {
            diff < 30 ? alert("date to close") : "";
            diff > 90 ? alert("date to broad") : "";
            return;
        }
        this.setState({
            data: { ...this.state.data, [event]: moment(date._d) }
        });
    }
    _onSelect( key, option) {
        if (this.state.data[key] == option.filter(x => x.label != "").map(x => x.label).join(',')) return;
        console.log('You selected ', option.label)
        this.setState({ data: { ...this.state.data, [key]: option.filter(x => x.label != "").map(x => x.label).join(',')} })
    }
    componentDidMount() {
        this.updateData(1);
    }
    render() {
        const { search, value } = this.state;
        let formContent = [];
        for (let key in this.state.data) {
            if (this.state.data.hasOwnProperty(key) && key != "id") {
                let value = this.state.data[key];
                if (key.includes("date")) {
                    formContent.push(
                        <div class="form-group">
                            <label for="exampleInputPassword1">{key.toUpperCase().replaceAll("_", " ")}</label>
                            <DatePicker
                                selected={value}
                                key={key}
                                onChange={this.handleDateChange.bind(this, key)}
                                className="form-control"
                            />
                        </div>
                    )
                }
                else if (key == "backgrounds" || key == "skills") {
                    formContent.push(
                        <div class="form-group">
                            <label for="exampleInputPassword1">{key.toUpperCase().replaceAll("_", " ")}</label>
                            <Dropdown
                                options={this.state.options}
                                onChange={this._onSelect.bind(this,key)}
                                value={value.split(',').map(x => { return { value: x, label: x } })}
                                placeholder="Select an option"
                                id={key}
                                />
                        </div>
                    )
                }
                else if (key == "city") {
                    formContent.push(
                        <div class="form-group">
                        <label for="exampleInputPassword1">{key.toUpperCase().replaceAll("_", " ")}</label>
                        <ReactGoogleMapLoader
                            params={{
                                key: MY_API_KEY,
                                libraries: "places,geocode",
                            }}
                            render={googleMaps =>
                                googleMaps && (
                                    <ReactGooglePlacesSuggest
                                        googleMaps={googleMaps}
                                        autocompletionRequest={{
                                            input: search,
                                            // Optional options
                                            // https://developers.google.com/maps/documentation/javascript/reference?hl=fr#AutocompletionRequest
                                        }}
                                        // Optional props
                                        onSelectSuggest={this.handleSelectSuggest}
                                        textNoResults="My custom no results text" // null or "" if you want to disable the no results item
                                        customRender={prediction => (
                                            <div className="customWrapper">
                                                {prediction
                                                    ? prediction.description
                                                    : "My custom no results text"}
                                            </div>
                                        )}
                                    >
                                        <input
                                            type="text"
                                            value={value}
                                            placeholder="Search a location"
                                            onChange={this.handleInputChange}
                                            className="form-control"
                                        />
                                    </ReactGooglePlacesSuggest>
                                )
                            }
                        />
                        </div>
                    )
                }
                else {
                    formContent.push(
                        <div class="form-group">
                            <label for="exampleInputPassword1">{key.toUpperCase().replaceAll("_", " ")}</label>
                            <input type="text" onChange={this.handleChange} className="form-control" id={key} placeholder={key} value={value} />
                        </div>
                    )
                }
            }
        }
        return (
            <div className="container body-container">
                <form>
                    {formContent}
                    <button type="button" onClick={this.handleSaveClick} class="btn btn-primary">Update</button>
                    <button type="button" onClick={this.handleCancelClick} class="btn">Cancel</button>
                </form>
            </div>
        )
    }
}

export default ViewOpportunities;

