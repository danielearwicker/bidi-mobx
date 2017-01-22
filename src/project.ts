import * as React from "react";
import { observer } from "mobx-react";

export function project<Model, View>(projection: (model: Model) => View) {

    return {
        render<ExtraProps>(
            render: (props: ExtraProps & { model: Model } & { view: View }) => JSX.Element
        ): React.ComponentClass<ExtraProps & { model: Model }> {

            return observer(class extends React.Component<ExtraProps & { model: Model }, {}> {

                private view: View;
                private model: Model;

                constructor(props: ExtraProps & { model: Model }) {
                    super(props);
                    this.model = props.model;
                    this.view = projection(props.model);
                }

                componentWillReceiveProps(props: ExtraProps & { model: Model }) {
                    if (props.model !== this.model) {
                        this.model = props.model;
                        this.view = projection(props.model);                        
                    }
                }

                render() {
                    return render({ ...this.props as any, view: this.view });
                }
            });
        }
    }
}
