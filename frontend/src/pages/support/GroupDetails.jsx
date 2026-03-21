import { useParams } from "react-router-dom";

export default function GroupDetails() {
    const { id } = useParams();
    return <h2>Group Details: {id}</h2>;
}
