import { Link } from "react-router-dom";
import { useGlobalContext } from "../../providers/ConfigProvider";

const UserOrgs = () => {
    const { organization } = useGlobalContext();
    return (
        <div>
            <h1>Organizations</h1>
            <ul>
                {organization?.map((org) => {
                    return (
                        <li key={org.id}>
                            <Link to={`/org/${org.id}/dashboard`}>
                                {org.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default UserOrgs;
