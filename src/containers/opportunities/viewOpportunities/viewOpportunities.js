import React, { Component } from 'react';
import axios from 'axios';
class ViewOpportunities extends Component{
    constructor(props){
        super(props);
        this.state = { data: [], currentPage:1,totalPage:200 };
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
    }

    updateData = function (page) {
        var self = this;
        var dataDisp = [];
        axios.get('http://gisapi-web-staging-1636833739.eu-west-1.elb.amazonaws.com/v2/opportunities?access_token=dd0df21c8af5d929dff19f74506c4a8153d7acd34306b9761fd4a57cfa1d483c&page=' + page||1)
            .then(function (response) {
                console.log(response.data.data);
                let totalPage =response.data.paging.total_pages;
                let currentPage = response.data.paging.current_page;
                response.data.data.map(x => {
                    let data = {};
                    data.id=x.id;
                    data.title = x.title;
                    data.applications_close_date = x.applications_close_date;
                    data.earliest_start_date = x.earliest_start_date;
                    data.latest_end_date = data.latest_end_date;
                    axios.get('http://gisapi-web-staging-1636833739.eu-west-1.elb.amazonaws.com/v2/opportunities/' + x.id + '?access_token=dd0df21c8af5d929dff19f74506c4a8153d7acd34306b9761fd4a57cfa1d483c')
                        .then(function (response) {
                            console.log(response);
                            data.description = response.data.description;
                            data.backgrounds = response.data.backgrounds.map(x => x.name).join();
                            data.skills = response.data.skills.map(x => x.name).join();
                            data.selection_process = response.data.role_info.selection_process;
                            data.salary = response.data.specifics_info.salary;
                            data.city = response.data.role_info.city;
                            dataDisp.push(data);
                            self.setState((prevState, props) => ({
                                data: dataDisp,
                                totalPage:totalPage,
                                currentPage: currentPage
                            }))
                        })
                })

            })
            .catch(function (error) {
                console.log(error);
            });
    }

    handleClick(event) {
        // this.setState({
        //     currentPage: Number(event.target.id)
        // });
        this.updateData(Number(event.target.id));
    }
    handleEditClick(event){
        this.props.history.push({
            pathname: '/' + Number(event.target.id)
        })
    }
    
    componentDidMount(){
        this.updateData(1);
    }
    render(){
        let header=[];
        for (let key in this.state.data[0]) {
            if (this.state.data[0].hasOwnProperty(key) && key!="id") {
                header.push(key);
            }
        }
        let tableHeader=header.map(x=>{ return (
            <th>{x.toUpperCase().replaceAll("_"," ")}</th>
        )})
        tableHeader.push(<th>View/Edit</th>)
        const pageNumbers = [];
        for (let i = 1; i <= this.state.totalPage; i++) {
            pageNumbers.push(i);
        }
        const renderPageNumbers = pageNumbers.map(number => {
            return (
                <li className={this.state.currentPage == number ? 'active' : ''}>
                    <a          
                        key={number}
                        id={number}
                        onClick={this.handleClick}
                    >{number}</a>
                </li>
            );
        });

        let list=this.state.data.map(x=>{return (
            <tr key={x.id}>
                <td>{x.title}</td>
                <td>{x.applications_close_date}</td>
                <td>{x.earliest_start_date}</td>
                <td>{x.latest_end_date}</td>
                <td>{x.description}</td>
                <td>{x.backgrounds}</td>
                <td>{x.skills}</td>
                <td>{x.selection_process}</td>
                <td>{x.salary}</td>
                <td>{x.city}</td>
                <td><a
                    key={x.id}
                    id={x.id}
                    onClick={this.handleEditClick}
                >Edit</a></td>
            </tr>  
        )})
        return (
            <div>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover table-condensed">
                        <thead>
                            <tr>
                                {tableHeader}
                            </tr>
                        </thead>
                        <tbody>
                            {list}
                        </tbody>
                    </table>
                </div>
                <ul id="page-numbers" className="pagination">
                        {renderPageNumbers}
                    </ul>
            </div>
        )
    }
}

export default ViewOpportunities;