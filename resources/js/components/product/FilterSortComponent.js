import React, { Component } from "react";
import Http from "../../Http";
import { useHistory } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Spin, Select, Space } from "antd";
import "./css/FilterSortComponent.scss";
import DistanceSort from "./DistanceComponent";
import PriceFilterComponent from "./priceFilterComponent";
import { connect } from "react-redux";
import AddProductComponent from "./AddProductComponent";

const queryString = require("query-string");
const { Option } = Select;
const history = createBrowserHistory();

class FilterSort extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: "",
            cities: [],
            city: undefined,
            price: [], //min=price[0]; max=price[1];
            location: [] //lat=location[0]; lng=location[1];
        };
        this.getProductSearchResult = this.getProductSearchResult.bind(this);
        this.onCityChange = this.onCityChange.bind(this);
        this.getCityList = this.getCityList.bind(this);
        // this.onPriceSortChange = this.onPriceSortChange.bind(this);
    }

    componentDidMount() {
        this.getProductSearchResult();
        this.getCityList();
    }
    componentDidUpdate(prevProps) {
        if (
            location.search !== undefined &&
            location.search !== prevProps.location.search
        ) {
            this.getProductSearchResult();
        }
    }

    getCityList() {
        Http.get(process.env.MIX_API_URL + "api/product/cities")
            .then(response => {
                if (response.data) {
                    this.setState({ cities: response.data });
                } else {
                    console.log("Lấy danh sách tỉnh thành phố thất bại.");
                }
            })
            .catch(error => {
                console.log(error.response.status);
            });
    }
    onCityChange(value) {
        const condition = queryString.parse(location.search);
        condition.page = 1;
        if (value === undefined) {  //Nếu xóa city
            if (condition.city) {
                delete condition.city;
            } else {
                return;
            }
        } else {
            condition.city = value;
        }
        let stringified = queryString.stringify(condition);
        if (stringified) stringified = "?" + stringified;
        this.props.history.push({
            pathname: location.pathname,
            search: stringified
        });
    }

    getProductSearchResult() {
        this.props.changeLoading(true);
        const condition = queryString.parse(location.search);
        if (condition.price) {
            condition.price = condition.price.split("-");
        }
        this.setState({
            city: condition.city,
            price: condition.price,
            location: condition.location
        });
        // this.props.changeKeyword(condition.k);
        const uri = condition.page
            ? process.env.MIX_API_URL + "api/product/filter?page=" + condition.page
            : process.env.MIX_API_URL + "api/product/filter";
        const request = {
            product_name: condition.k,
            city: condition.city,
            price: condition.price,
            location: condition.location
        };
        Http.post(uri, request).then(response => {
            if (response) {
                console.log(response.data);
                this.props.setProducts(response.data.data);
                this.props.changePagination(response.data.total, response.data.per_page);
                this.props.changeLoading(false);
            } else {
                console.log("Tìm kiếm thất bại");
                this.props.changeLoading(false);
            }
        });
    }

    render() {
        return (
            <div className="filter-and-sort d-flex justify-content-between">
                <Space>
                    <Select
                        className={
                            this.state.city
                                ? "city-seletected"
                                : "city-not-seletected"
                        }
                        allowClear
                        value={this.state.city}
                        showSearch
                        style={{ width: 110 }}
                        placeholder="Toàn quốc"
                        optionFilterProp="children"
                        onChange={this.onCityChange}
                        filterOption={(input, option) =>
                            option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {this.state.cities
                            ? this.state.cities.map((city, index) => (
                                  <Option value={city} key={index}>
                                      {city}
                                  </Option>
                              ))
                            : null}
                    </Select>
                    <PriceFilterComponent
                        location={this.props.location}
                        history={this.props.history}
                    />
                    <DistanceSort
                        location={this.props.location}
                        history={this.props.history}
                    />
                </Space>
                <AddProductComponent updateProductList={() => this.getProductSearchResult()} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        products: state.productDetail.products,
        auth: state.auth
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setProducts: products => {
            dispatch({
                type: "SET_PRODUCTS",
                payload: products
            });
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FilterSort);
