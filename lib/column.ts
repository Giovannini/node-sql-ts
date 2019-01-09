'use strict';

import _ = require('lodash');
import { ColumnNode, IValueExpressionMixin, OrderByValueNode, TextNode, valueExpressionMixin } from './node';
import { INodeable } from './nodeable';
import { Table } from './table';

interface ColumnConfig {
    name?: string;
    property?: string;
    autoGenerated?: boolean;
    jsType?: any;
    dataType?: string;
    primaryKey?: boolean;
    references?:
        | string
        | {
              table?: string;
              column?: string;
              constraint?: string;
              onDelete?: 'restrict' | 'cascade' | 'no action' | 'set null' | 'set default';
              onUpdate?: 'restrict' | 'cascade' | 'no action' | 'set null' | 'set default';
          };
    notNull?: boolean;
    unique?: boolean;
    defaultValue?: any;
    subfields?: string[];
    table?: Table<any>;
    star?: boolean;
    subfieldContainer?: Column<any>;
    isConstant?: boolean;
    constantValue?: any;
}

export class Column<T> implements INodeable {
    public name: string;
    public property?: string;
    public table?: Table<any>;
    public asc: this;
    public alias?: string;
    public desc: OrderByValueNode;
    public dataType?: string;
    // tslint:disable-next-line:variable-name
    public _value: any;
    public star?: boolean;
    public subfields: { [key: string]: Column<any> } = {};
    public asArray?: boolean = false;
    public aggregator?: string;
    public isConstant?: boolean;
    public constantValue?: any;
    public primaryKey?: boolean;
    public notNull?: boolean;
    public defaultValue?: any;
    public references?:
        | string
        | {
              table?: string;
              column?: string;
              constraint?: string;
              onDelete?: 'restrict' | 'cascade' | 'no action' | 'set null' | 'set default';
              onUpdate?: 'restrict' | 'cascade' | 'no action' | 'set null' | 'set default';
          };
    public subfieldContainer?: Column<any>;
    public autoGenerated?: boolean;
    public unique?: boolean;
    public isDistinct?: boolean;
    constructor(config: ColumnConfig) {
        this.name = config.name as string;
        this.property = config.property;
        this.star = config.star;
        this.table = config.table;
        this.asc = this;
        this.alias = undefined;
        this.desc = new OrderByValueNode({
            direction: new TextNode('DESC'),
            value: this.toNode()
        });
        this.isConstant = config.isConstant;
        this.constantValue = config.constantValue;
        this.dataType = config.dataType;
        this.primaryKey = config.primaryKey;
        this.notNull = config.notNull;
        this.defaultValue = config.defaultValue;
        this.references = config.references;
        this.subfieldContainer = config.subfieldContainer;
        this.autoGenerated = config.autoGenerated;
        this.unique = config.unique;
    }
    public value(value: any): Column<T> {
        const context = contextify(this);
        context._value = value;
        return context;
    }
    public getValue() {
        return this._value;
    }
    public toNode(): ColumnNode {
        // creates a query node from this column
        return new ColumnNode(contextify(this));
    }
    public as(alias: string): ColumnNode {
        const context = contextify(this);
        context.alias = alias;
        return new ColumnNode(context);
    }
    public arrayAgg(alias?: string): ColumnNode {
        const context = contextify(this);
        context.asArray = true;
        context.alias = alias || context.name + 's';
        return new ColumnNode(context);
    }
    public aggregate(alias: string | undefined, aggregator: string): ColumnNode {
        const context = contextify(this);
        context.aggregator = aggregator.toUpperCase();
        context.alias = alias || context.name + '_' + context.aggregator.toLowerCase();
        return new ColumnNode(context);
    }
    public count(alias?: string) {
        return this.aggregate(alias, 'count');
    }
    public min(alias?: string) {
        return this.aggregate(alias, 'min');
    }
    public max(alias?: string) {
        return this.aggregate(alias, 'max');
    }
    public sum(alias?: string) {
        return this.aggregate(alias, 'sum');
    }
    public avg(alias?: string) {
        return this.aggregate(alias, 'avg');
    }
    public distinct(): ColumnNode {
        const context = contextify(this);
        context.isDistinct = true;
        return new ColumnNode(context);
    }
    public toQuery() {
        return this.toNode().toQuery();
    }
}

// mix in value expression
_.extend(Column.prototype, valueExpressionMixin());

const contextify = <T>(base: Column<T>): Column<T> => {
    const context = Object.create(Column.prototype);
    Object.keys(base).forEach((key) => {
        context[key] = (base as any)[key];
    });
    return context;
};

// tslint:disable-next-line:no-empty-interface
export interface Column<T> extends IValueExpressionMixin {}
